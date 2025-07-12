const admin = require("firebase-admin");
const { getFirebaseApp } = require("../config/firebase");
const { logger } = require("../utils/logger");

/**
 * UploadService handles file uploads and deletions from Firebase Storage.
 *
 * This service uses the initialized Firebase Admin SDK to interact with
 * Google Cloud Storage.
 *
 */
class UploadService {
  /**
   * Uploads a file to Firebase Storage and returns the public URL.
   *
   * @param {Object} file - The file object (typically from multer).
   * @param {Buffer} file.buffer - The file content as buffer.
   * @param {string} file.originalname - The original file name.
   * @param {string} file.mimetype - The file MIME type.
   *
   * @returns {Promise<string|null>} - Public URL of the uploaded file, or null if no file.
   *
   * @throws {Error} - If Firebase is not initialized or upload fails.
   */
  async uploadToFirebase(file) {
    if (!file) return null;

    try {
      const app = getFirebaseApp();
      if (!app) {
        throw new Error("Firebase not initialized");
      }

      const bucket = admin.storage().bucket();
      const fileName = `cms-receipts/${Date.now()}-${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        stream.on("error", (error) => {
          logger.error("Firebase upload error:", error);
          reject(error);
        });

        stream.on("finish", async () => {
          try {
            await fileUpload.makePublic();

            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve(publicUrl);
          } catch (error) {
            logger.error("Firebase make public error:", error);
            reject(error);
          }
        });

        stream.end(file.buffer);
      });
    } catch (error) {
      logger.error("Upload service error:", error);
      throw error;
    }
  }

  /**
   * Deletes a file from Firebase Storage by its public URL.
   *
   * @param {string} imageUrl - The public URL of the file to delete.
   *
   * @returns {Promise<void>}
   */
  async deleteFromFirebase(imageUrl) {
    if (!imageUrl) return;

    try {
      const app = getFirebaseApp();
      if (!app) return;

      const bucket = admin.storage().bucket();

      // Extract only the filename from the public URL
      const fileName = imageUrl.split("/").pop();

      if (fileName) {
        await bucket.file(`cms-receipts/${fileName}`).delete();
      }
    } catch (error) {
      logger.error("Firebase delete error:", error);
    }
  }
}

module.exports = new UploadService();
