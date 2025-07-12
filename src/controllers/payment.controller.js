const PaymentService = require("../services/payment.service");
const uploadService = require("../services/upload.service");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");

/**
 * Controller for managing payment operations
 */
class PaymentController {
  /**
   * @route POST /payments
   * @desc Create a new payment
   * @access Private (Member/Admin)
   */
  async createPayment(req, res, next) {
    try {
      const payment = await PaymentService.createPayment(req.body, req.user.id);
      res
        .status(HTTP_STATUS.CREATED)
        .json(
          formatResponse(true, "Payment created successfully", { payment })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /payments
   * @desc Retrieve all payments (with filters and pagination)
   * @access Private (Admin)
   */
  async getAllPayments(req, res, next) {
    try {
      const result = await PaymentService.getAllPayments(req.query);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(
            true,
            "Payments retrieved successfully",
            result.payments,
            result.pagination
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /payments/:id
   * @desc Get a single payment by ID
   * @access Private (Admin/Member)
   */
  async getPaymentById(req, res, next) {
    try {
      const payment = await PaymentService.getPaymentById(req.params.id);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Payment retrieved successfully", { payment })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /payments/:id
   * @desc Update a payment record
   * @access Private (Admin)
   */
  async updatePayment(req, res, next) {
    try {
      const payment = await PaymentService.updatePayment(
        req.params.id,
        req.body
      );
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Payment updated successfully", { payment })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /payments/member/:memberId
   * @desc Get all payments made by a specific member
   * @access Private (Admin/Staff)
   */
  async getPaymentsByMember(req, res, next) {
    try {
      const payments = await PaymentService.getPaymentsByMember(
        req.params.memberId
      );
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Member payments retrieved successfully", {
            payments,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /payments/event/:eventId
   * @desc Get all payments related to an event
   * @access Private (Admin/Staff)
   */
  async getEventPayments(req, res, next) {
    try {
      const result = await PaymentService.getEventPayments(req.params.eventId);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Event payments retrieved successfully", result)
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /payments/:id/upload-receipt
   * @desc Upload a receipt file and attach it to a payment
   * @access Private (Member/Admin)
   */
  async uploadReceipt(req, res, next) {
    try {
      if (!req.file) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(formatResponse(false, "Receipt file is required"));
      }

      const receiptUrl = await uploadService.uploadToFirebase(
        req.file,
        "receipts"
      );
      const payment = await PaymentService.uploadReceipt(
        req.params.id,
        receiptUrl
      );

      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Receipt uploaded successfully", { payment })
        );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
