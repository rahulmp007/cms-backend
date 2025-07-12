const QRCode = require("qrcode");

class QRCodeService {
  /**
   * Generates a QR code for a member.
   *
   * @param {string} memberId - MongoDB ObjectId of the member.
   * @param {string} memberIdString - Public-facing member ID string.
   * @returns {Promise<string>} Base64-encoded PNG QR code data URL.
   */
  async generateMemberQR(memberId, memberIdString) {
    try {
      const qrData = {
        type: "member",
        memberId: memberIdString, // Public ID only
        id: memberId,
        timestamp: new Date().toISOString(),
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: "M",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 256,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generates a QR code for an event.
   *
   * @param {string} eventId - MongoDB ObjectId of the event.
   * @param {string} eventTitle - Public-facing title of the event.
   * @returns {Promise<string>} Base64-encoded PNG QR code data URL.
   */
  async generateEventQR(eventId, eventTitle) {
    try {
      const qrData = {
        type: "event",
        eventId,
        title: eventTitle,
        timestamp: new Date().toISOString(),
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: "M",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 256,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Failed to generate event QR code: ${error.message}`);
    }
  }

  /**
   * Decodes a QR string (assumed to be JSON).
   * Use this when scanning and processing the QR content.
   *
   * @param {string} qrString - JSON-encoded string extracted from QR.
   * @returns {Object} Parsed object (e.g., with type, memberId/eventId, timestamp).
   * @throws {Error} If the string is not valid JSON.
   */
  decodeQR(qrString) {
    try {
      return JSON.parse(qrString);
    } catch (error) {
      throw new Error("Invalid QR code format");
    }
  }
}

module.exports = new QRCodeService();
