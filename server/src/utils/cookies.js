function buildAuthCookieOptions() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const secure =
    (process.env.COOKIE_SECURE || "").toLowerCase() === "true" ||
    nodeEnv === "production";

  const sameSite = process.env.COOKIE_SAME_SITE || "lax";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

module.exports = { buildAuthCookieOptions };
