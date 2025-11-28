// Simple Cloudinary multer storage
// --------------------------------
// This file provides a very small, easy-to-understand multer storage
// implementation that uploads incoming files directly to Cloudinary
// using the official `cloudinary` v2 SDK.
//
// Why: originally a custom wrapper was used to avoid older adapters
// that required `cloudinary@1.x`. We're now using a modern adapter
// (`@fluidjs/multer-cloudinary`) compatible with `cloudinary@2.x` so
// upload handling is delegated and easier to maintain.
//
// Usage: Import `storage` into your multer config (see
// `Backend/utils/uploadMiddleware.js`) and use as the `storage` option.
// The implementation uses `streamifier` to pipe buffer uploads into
// `cloudinary.uploader.upload_stream`.

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Minimal, dependency-light multer storage engine compatible with multer.
// This avoids introducing adapters that require older `express` or
// `cloudinary` peer versions. It pipes multer's file stream or buffer
// to Cloudinary's `upload_stream` and returns a small result object.
class MulterCloudinaryStorage {
  constructor(opts = {}) {
    this.cloudinary = opts.cloudinary || cloudinary;
    this.folder = opts.folder || "sharefy_project_media";
    this.resource_type = opts.resource_type || "auto";
  }

  _handleFile(req, file, cb) {
    const params = {
      folder: this.folder,
      resource_type: this.resource_type,
    };

    const uploadStream = this.cloudinary.uploader.upload_stream(
      params,
      function (error, result) {
        if (error) return cb(error);
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          bytes: result.bytes,
          mimetype: file.mimetype,
          raw: result,
        });
      }
    );

    if (file.stream) {
      file.stream.pipe(uploadStream);
    } else if (file.buffer) {
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    } else {
      cb(new Error("No file stream or buffer available for upload"));
    }
  }

  _removeFile(req, file, cb) {
    const publicId = file.filename || (file.raw && file.raw.public_id);
    if (!publicId) return cb(null);
    this.cloudinary.uploader.destroy(
      publicId,
      { resource_type: file.raw?.resource_type || "image" },
      function (err) {
        cb(err || null);
      }
    );
  }
}

const storage = new MulterCloudinaryStorage({ cloudinary, folder: "sharefy_project_media", resource_type: "auto" });

export { cloudinary, storage };
