// Better Error handling

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  //Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  //Duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate Error",
      details: "This record already exists",
    });
  }

  //Default error
  res.status(500).json({
    error: "Server Error",
    details: err.message,
  });
};

export default errorHandler;
