import Joi from "joi";
import { sanitize, sanitizeWithFormatting } from "./sanitizer.js";

// Custom Joi extension for HTML sanitization
const joiWithSanitize = Joi.extend({
  type: 'string',
  base: Joi.string(),
  messages: {
    'string.sanitize': '{{#label}} contains invalid characters'
  },
  rules: {
    sanitize: {
      method() {
        return this.$_addRule({ name: 'sanitize' });
      },
      validate(value, helpers) {
        return sanitize(value);
      }
    },
    sanitizeWithFormatting: {
      method() {
        return this.$_addRule({ name: 'sanitizeWithFormatting' });
      },
      validate(value, helpers) {
        return sanitizeWithFormatting(value);
      }
    }
  }
});

// ------------------ User Registration Schema ------------------
const registerSchema = joiWithSanitize.object({
  fullName: joiWithSanitize.string().trim().sanitize().required().messages({
    "string.empty": "Full name is required",
  }),
  username: joiWithSanitize.string().lowercase().trim().sanitize().alphanum().required().messages({
    "string.empty": "Username is required",
    "string.alphanum": "Username can only contain letters and numbers",
  }),
  email: joiWithSanitize.string().email().lowercase().trim().sanitize().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),
  phoneNumber: Joi.number().optional(),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  bio: joiWithSanitize.string().max(200).sanitizeWithFormatting().optional(),
  profileImage: Joi.string().uri().optional(),
  coverImage: Joi.string().uri().optional(),
});

// ------------------ User Login Schema ------------------
const loginSchema = joiWithSanitize.object({
  email: joiWithSanitize.string().email().lowercase().trim().sanitize().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

// ------------------ Post Schema ------------------
const postSchema = joiWithSanitize.object({
  caption: joiWithSanitize.string().max(2200).sanitizeWithFormatting().optional().allow(''),
});

// ------------------ Comment Schema ------------------
const commentSchema = joiWithSanitize.object({
  text: joiWithSanitize.string().max(500).sanitizeWithFormatting().required().messages({
    "string.empty": "Comment text is required",
    "string.max": "Comment cannot exceed 500 characters",
  }),
});

// ------------------ User Profile Update Schema ------------------
const profileUpdateSchema = joiWithSanitize.object({
  fullName: joiWithSanitize.string().trim().sanitize().optional(),
  username: joiWithSanitize.string().lowercase().trim().sanitize().alphanum().optional(),
  bio: joiWithSanitize.string().max(200).sanitizeWithFormatting().optional().allow(''),
  email: joiWithSanitize.string().email().lowercase().trim().sanitize().optional(),
});

// ------------------ Message Schema ------------------
const messageSchema = joiWithSanitize.object({
  message: joiWithSanitize.string()
    .trim()
    .min(1)
    .max(2000)
    .sanitizeWithFormatting()
    .required()
    .messages({
      "string.empty": "Message cannot be empty",
      "string.min": "Message cannot be empty",
      "string.max": "Message is too long (maximum 2000 characters)",
    }),
});

// ------------------ Story Schema ------------------
const storySchema = joiWithSanitize.object({
  caption: joiWithSanitize.string()
    .max(200)
    .sanitizeWithFormatting()
    .optional()
    .allow('')
    .messages({
      "string.max": "Caption cannot exceed 200 characters",
    }),
});

// ------------------ Middleware for Validation ------------------
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true // Remove unknown fields
  });
  
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, errors });
  }
  
  // Replace req.body with sanitized and validated data
  req.body = value;
  next();
};

// Export schemas for middleware
export const registerValidation = validate(registerSchema);
export const loginValidation = validate(loginSchema);
export const postValidation = validate(postSchema);
export const commentValidation = validate(commentSchema);
export const profileUpdateValidation = validate(profileUpdateSchema);
export const messageValidation = validate(messageSchema);
export const storyValidation = validate(storySchema);
