import { AppError } from "../types/appError.js";
const globalErrorHandler = (err, req, res, next) => {
    const { statusCode } = err;
    if (err instanceof AppError) {
        const { statusCode, message } = err;
        res.status(statusCode).render("error", {
            status: err.status || "error",
            statusCode,
            message,
        });
    }
    else {
        console.error("Unexpected error:", err);
        res.status(500).render("error", {
            status: "error",
            message: "Internal Server Error",
            statusCode,
        });
    }
};
export { globalErrorHandler };
