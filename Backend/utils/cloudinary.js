import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Minimal multer storage engine compatible with multer's storage API.
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
          mimetype: result.resource_type === "video" ? file.mimetype : file.mimetype,
          raw: result,
        });
      }
    );

    // pipe the file stream to cloudinary
    if (file.stream) {
      file.stream.pipe(uploadStream);
    } else if (file.buffer) {
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    } else {
      cb(new Error("No file stream or buffer available for upload"));
    }
  }

  _removeFile(req, file, cb) {
    // attempt to remove by public_id if present
    const publicId = file.filename || (file.raw && file.raw.public_id);
    if (!publicId) return cb(null);
    this.cloudinary.uploader.destroy(publicId, { resource_type: file.raw?.resource_type || "image" }, function (err, res) {
      cb(err || null);
    });
  }
}

const storage = new MulterCloudinaryStorage({ cloudinary, folder: "sharefy_project_media", resource_type: "auto" });

export { cloudinary, storage };
