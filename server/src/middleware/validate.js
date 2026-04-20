const { ZodError } = require("zod");

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });
      req.validated = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: err.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message
          }))
        });
      }
      next(err);
    }
  };
}

module.exports = { validate };
