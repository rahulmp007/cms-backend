const UploadService = require("../services/upload.service");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../utils/constants");

class UploadController {
  /**
   * @route POST /upload
   * @desc Upload a single file to a specific folder
   * @access Private
   */
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(formatResponse(false, "File is required"));
      }

      const { folder = "general" } = req.body;

      const fileUrl = await UploadService.uploadFile(req.file, folder);

      res.status(HTTP_STATUS.OK).json(
        formatResponse(true, "File uploaded successfully", {
          fileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /upload/multiple
   * @desc Upload multiple files to a specific folder
   * @access Private
   */
  async uploadMultipleFiles(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(formatResponse(false, "Files are required"));
      }

      const { folder = "general" } = req.body;

      const uploadPromises = req.files.map((file) =>
        UploadService.uploadFile(file, folder)
      );

      const fileUrls = await Promise.all(uploadPromises);

      const uploadedFiles = req.files.map((file, index) => ({
        fileUrl: fileUrls[index],
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
      }));

      res.status(HTTP_STATUS.OK).json(
        formatResponse(true, "Files uploaded successfully", {
          files: uploadedFiles,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /upload/:fileName
   * @desc Delete a file by name from a specific folder
   * @access Private
   */
  async deleteFile(req, res, next) {
    try {
      const { fileName } = req.params;
      const { folder = "general" } = req.query;

      if (!fileName) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(formatResponse(false, "File name is required"));
      }

      await UploadService.deleteFile(fileName, folder);

      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "File deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();
