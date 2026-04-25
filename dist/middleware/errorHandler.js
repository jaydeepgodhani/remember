const errorHandler = (err, req, res, next) => {
    console.error("Global error handler caught:", err);
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    const response = {
        success: false,
        message,
        status: statusCode,
    };
    return res.status(statusCode).json(response);
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map