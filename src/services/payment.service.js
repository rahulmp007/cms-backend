// src/services/paymentService.js

const Payment = require("../models/payment.model");
const Member = require("../models/member.model");
const Event = require("../models/event.model");
const { generatePaymentId } = require("../utils/helpers");
const logger = require("../utils/logger");
const uploadService = require("../services/upload.service");

class PaymentService {
  /**
   * Creates a new payment record for a member (event or membership fee).
   * @param {Object} paymentData - Payment data including memberId, amount, type, etc.
   * @param {ObjectId} processedBy - Admin or staff user who processed the payment.
   * @returns {Promise<Object>} The created payment document.
   */
  async createPayment(paymentData, processedBy) {
    const member = await Member.findById(paymentData.memberId);
    if (!member || !member.isActive) {
      throw new Error("Member not found");
    }

    if (paymentData.eventId) {
      const event = await Event.findById(paymentData.eventId);
      if (!event || !event.isActive) {
        throw new Error("Event not found");
      }
    }

    let paymentId,
      isUnique = false;
    while (!isUnique) {
      paymentId = generatePaymentId();
      const existing = await Payment.findOne({ paymentId });
      if (!existing) isUnique = true;
    }

    const payment = new Payment({
      paymentId,
      member: paymentData.memberId,
      amount: paymentData.amount,
      paymentType: paymentData.paymentType,
      paymentMethod: paymentData.paymentMethod,
      description: paymentData.description,
      event: paymentData.eventId,
      transactionId: paymentData.transactionId,
      processedBy,
    });

    await payment.save();

    await payment.populate([
      { path: "member", select: "name memberId phone" },
      { path: "event", select: "title eventDate" },
      { path: "processedBy", select: "name" },
    ]);

    return payment;
  }

  /**
   * Retrieves all payments based on optional filters.
   * @param {Object} filters - Query filters such as memberId, paymentType, date range, etc.
   * @returns {Promise<Object>} Paginated result with payments and pagination info.
   */
  async getAllPayments(filters = {}) {
    const {
      memberId,
      paymentType,
      status,
      eventId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = "paymentDate",
      sortOrder = "desc",
    } = filters;

    const query = { isActive: true };
    if (memberId) query.member = memberId;
    if (paymentType) query.paymentType = paymentType;
    if (status) query.status = status;
    if (eventId) query.event = eventId;
    if (dateFrom || dateTo) {
      query.paymentDate = {};
      if (dateFrom) query.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) query.paymentDate.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("member", "name memberId phone")
        .populate("event", "title eventDate")
        .populate("processedBy", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Fetches a single payment by its ID.
   * @param {ObjectId} paymentId - The ID of the payment to retrieve.
   * @returns {Promise<Object>} The payment document.
   */
  async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId)
      .populate("member", "name memberId phone")
      .populate("event", "title eventDate location")
      .populate("processedBy", "name");

    if (!payment || !payment.isActive) {
      throw new Error("Payment not found");
    }

    return payment;
  }

  /**
   * Updates a payment record.
   * @param {ObjectId} paymentId - The ID of the payment to update.
   * @param {Object} updateData - The new data to apply.
   * @returns {Promise<Object>} The updated payment document.
   */
  async updatePayment(paymentId, updateData) {
    const payment = await Payment.findById(paymentId);
    if (!payment || !payment.isActive) {
      throw new Error("Payment not found");
    }

    Object.assign(payment, updateData);
    await payment.save();

    await payment.populate([
      { path: "member", select: "name memberId phone" },
      { path: "event", select: "title eventDate" },
      { path: "processedBy", select: "name" },
    ]);

    return payment;
  }

  /**
   * Gets all payments made by a specific member.
   * @param {ObjectId} memberId - Member's ID.
   * @returns {Promise<Array>} List of payment documents.
   */
  async getPaymentsByMember(memberId) {
    const member = await Member.findById(memberId);
    if (!member || !member.isActive) {
      throw new Error("Member not found");
    }

    const payments = await Payment.find({ member: memberId, isActive: true })
      .populate("event", "title eventDate")
      .sort({ paymentDate: -1 });

    return payments;
  }

  /**
   * Gets all payments for a specific event with summary statistics.
   * @param {ObjectId} eventId - Event ID.
   * @returns {Promise<Object>} Event payments and summary.
   */
  async getEventPayments(eventId) {
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      throw new Error("Event not found");
    }

    const payments = await Payment.find({ event: eventId, isActive: true })
      .populate("member", "name memberId phone")
      .sort({ paymentDate: -1 });

    const summary = {
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      totalPayments: payments.length,
      completedPayments: payments.filter((p) => p.status === "Completed")
        .length,
      pendingPayments: payments.filter((p) => p.status === "Pending").length,
    };

    return {
      eventTitle: event.title,
      payments,
      summary,
    };
  }

  /**
   * Attaches a receipt file to a payment record.
   * @param {ObjectId} paymentId - ID of the payment.
   * @param {string} receiptUrl - URL of the uploaded receipt.
   * @returns {Promise<Object>} Updated payment record.
   */
  async uploadReceipt(paymentId, receiptUrl) {
    const payment = await Payment.findById(paymentId);
    if (!payment || !payment.isActive) {
      const error = new Error("Payment not found");
      error.statusCode = 404;
      throw error;
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { receiptFile: receiptUrl },
      { new: true, runValidators: true }
    ).populate([
      { path: "member", select: "name memberId phone" },
      { path: "event", select: "title eventDate" },
      { path: "processedBy", select: "name" },
    ]);

    return updatedPayment;
  }
}

module.exports = new PaymentService();
