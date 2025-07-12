const Member = require("../models/member.model");
const User = require("../models/user.model");
const Zone = require("../models/zone.model");
const qrService = require("./qr.service");
const { generateMemberId, generatePaymentId } = require("../utils/helpers");
const Payment = require("../models/payment.model");

class MemberService {
  /**
   * Creates a new member profile.
   * @param {Object} memberData - The data for the member.
   * @returns {Promise<Object>} The created member with populated data.
   * @throws {Error} If user is invalid, zone inactive, or member already exists.
   */
  async createMember(memberData) {
    const user = await User.findById(memberData.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "Member")
      throw new Error("User must have Member role to create member profile");

    const existingMember = await Member.findOne({ user: memberData.userId });
    if (existingMember)
      throw new Error("Member profile already exists for this user");

    const zone = await Zone.findById(memberData.zoneId);
    if (!zone || !zone.isActive) throw new Error("Zone not found or inactive");

    let memberId,
      isUnique = false;
    while (!isUnique) {
      memberId = generateMemberId();
      const existing = await Member.findOne({ memberId });
      if (!existing) isUnique = true;
    }

    const member = new Member({
      user: memberData.userId,
      memberId,
      name: memberData.name,
      phone: memberData.phone,
      address: memberData.address,
      zone: memberData.zoneId,
      membershipType: memberData.membershipType,
      dateOfBirth: memberData.dateOfBirth,
      renewalDate: memberData.renewalDate,
    });

    await member.save();

    const qrCode = await qrService.generateMemberQR(member._id, memberId);
    member.qrCode = qrCode;
    await member.save();

    await member.populate([
      { path: "zone", select: "name description" },
      { path: "user", select: "name email role" },
    ]);

    return member;
  }

  /**
   * Retrieves all active members with filters and pagination.
   * @param {Object} filters - Filter and pagination options.
   * @returns {Promise<Object>} Members and pagination metadata.
   */
  async getAllMembers(filters = {}) {
    const {
      zone,
      status,
      membershipType,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const query = { isActive: true };
    if (zone) query.zone = zone;
    if (status) query.status = status;
    if (membershipType) query.membershipType = membershipType;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { memberId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [members, total] = await Promise.all([
      Member.find(query)
        .populate({ path: "zone", select: "name" })
        .populate({ path: "user", select: "name email" })
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Member.countDocuments(query),
    ]);

    return {
      members,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMembers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Gets a single member by ID.
   * @param {string} memberId - The member's ID.
   * @returns {Promise<Object>} Member document.
   * @throws {Error} If member not found or inactive.
   */
  async getMemberById(memberId) {
    const member = await Member.findById(memberId)
      .populate({ path: "zone", select: "name description" })
      .populate({ path: "user", select: "name email role" });

    if (!member || !member.isActive) {
      throw new Error("Member not found");
    }

    return member;
  }

  /**
   * Updates member data.
   * @param {string} memberId - Member ID to update.
   * @param {Object} updateData - Fields to update.
   * @returns {Promise<Object>} Updated member document.
   * @throws {Error} If member or zone not found/inactive.
   */
  async updateMember(memberId, updateData) {
    const member = await Member.findById(memberId);
    if (!member || !member.isActive) throw new Error("Member not found");

    if (updateData.zoneId) {
      const zone = await Zone.findById(updateData.zoneId);
      if (!zone || !zone.isActive) {
        throw new Error("Zone not found or inactive");
      }
      updateData.zone = updateData.zoneId;
      delete updateData.zoneId;
    }

    Object.assign(member, updateData);
    await member.save();

    await member.populate([
      { path: "zone", select: "name description" },
      { path: "user", select: "name email role" },
    ]);
    return member;
  }

  /**
   * Soft deletes a member (marks inactive).
   * @param {string} memberId - Member ID.
   * @returns {Promise<Object>} Updated member document.
   * @throws {Error} If member not found.
   */
  async disableMember(memberId) {
    const member = await Member.findById(memberId);
    if (!member) throw new Error("Member not found");

    member.isActive = false;
    member.status = "Inactive";
    await member.save();

    return member;
  }

  /**
   * Retrieves or generates the QR code for a member.
   * @param {string} memberId - The ID of the member.
   * @returns {Promise<Object>} QR code and member info.
   * @throws {Error} If member not found.
   */
  async getMemberQRCode(memberId) {
    const member = await Member.findById(memberId);
    if (!member || !member.isActive) throw new Error("Member not found");

    if (!member.qrCode) {
      const qrCode = await qrService.generateMemberQR(
        member._id,
        member.memberId
      );
      member.qrCode = qrCode;
      await member.save();
    }

    return {
      memberId: member.memberId,
      memberName: member.name,
      qrCode: member.qrCode,
    };
  }

  /**
   * Searches active members by name, member ID, or phone.
   * @param {string} searchTerm - Search string.
   * @returns {Promise<Object[]>} Matching member documents.
   */
  async searchMembers(searchTerm) {
    const query = {
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { memberId: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const members = await Member.find(query)
      .populate({ path: "zone", select: "name" })
      .populate({ path: "user", select: "name email" })
      .limit(20)
      .sort({ name: 1 });

    return members;
  }

  /**
   * Renews a member's membership and creates a payment record.
   * @param {string} memberId - ID of the member to renew.
   * @param {Object} renewalData - Renewal details (period, amount, method, transactionId).
   * @param {string} processedBy - ID of the admin/user processing the renewal.
   * @returns {Promise<Object>} Updated member, new payment, and date history.
   * @throws {Error} If member not found.
   */
  async renewMembership(memberId, renewalData, processedBy) {
    const member = await Member.findById(memberId);
    if (!member || !member.isActive) throw new Error("Member not found");

    const currentRenewalDate = new Date(member.renewalDate);
    const newRenewalDate = new Date(currentRenewalDate);
    newRenewalDate.setMonth(
      newRenewalDate.getMonth() + renewalData.renewalPeriod
    );

    let paymentId,
      isUnique = false;
    while (!isUnique) {
      paymentId = generatePaymentId();
      const existing = await Payment.findOne({ paymentId });
      if (!existing) isUnique = true;
    }

    const payment = new Payment({
      paymentId,
      member: memberId,
      amount: renewalData.paymentAmount,
      paymentType: "Membership Fee",
      paymentMethod: renewalData.paymentMethod,
      description: `Membership renewal for ${renewalData.renewalPeriod} months`,
      transactionId: renewalData.transactionId,
      status: "Completed",
      processedBy,
    });

    await payment.save();

    member.renewalDate = newRenewalDate;
    member.status = "Active";
    await member.save();

    await member.populate([
      { path: "zone", select: "name description" },
      { path: "user", select: "name email role" },
    ]);
    await payment.populate([
      { path: "member", select: "name memberId" },
      { path: "processedBy", select: "name email role" },
    ]);

    return {
      member,
      payment,
      previousRenewalDate: currentRenewalDate,
      newRenewalDate: newRenewalDate,
    };
  }
}

module.exports = new MemberService();
