const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const { AppError } = require("../utils/appError");
const { asyncHandler } = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");
const { buildAuthCookieOptions } = require("../utils/cookies");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(200),
    password: z.string().min(8).max(200)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().max(200),
    password: z.string().min(1).max(200)
  })
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse({ body: req.body }).body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError("Email already in use", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash
  });

  const token = signToken({ sub: user._id.toString() });
  const cookieName = process.env.COOKIE_NAME || "cch_token";
  res.cookie(cookieName, token, buildAuthCookieOptions());

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse({ body: req.body }).body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const token = signToken({ sub: user._id.toString() });
  const cookieName = process.env.COOKIE_NAME || "cch_token";
  res.cookie(cookieName, token, buildAuthCookieOptions());

  res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

const logout = asyncHandler(async (req, res) => {
  const cookieName = process.env.COOKIE_NAME || "cch_token";
  res.clearCookie(cookieName, { path: "/" });
  res.json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

module.exports = { register, login, logout, me };
module.exports.schemas = { registerSchema, loginSchema };

