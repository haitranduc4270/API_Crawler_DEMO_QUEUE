
function errorHandler(err, req, res, next) {
  console.log(err);
  return res.status(err.statusCode || 500).json({
      status: err.statusCode || 500,
      message: err.message || "Something went wrong"
  });
}

module.exports = errorHandler;
