import Joi from "joi";

// ------------------ User Registration Schema ------------------
const registerSchema = Joi.object({
  fullName: Joi.string().trim().required().messages({
    "string.empty": "Full name is required",
  }),
  username: Joi.string().lowercase().trim().required().messages({
    "string.empty": "Username is required",
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),
  phoneNumber: Joi.number().optional(),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  bio: Joi.string().max(200).optional(),
  profileImage: Joi.string().uri().optional(),
  coverImage: Joi.string().uri().optional(),
});

// ------------------ User Login Schema ------------------
const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

// ------------------ Middleware for Validation ------------------
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }
  next();
};

// Export schemas for middleware
export const registerValidation = validate(registerSchema);
export const loginValidation = validate(loginSchema);
