class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ) {
        super(message); // Call the parent Error constructor with the message
        this.statusCode = statusCode; // HTTP status code
        this.data = null; // Placeholder for any additional data
        this.success = false; // Indicating failure
        this.error = error; // Array of error details

        // Handle stack trace
        if (stack) {
            this.stack = stack; // Assign custom stack trace if provided
        } else {
            Error.captureStackTrace(this, this.constructor); // Create stack trace without including this constructor
        }
    }
}
export {ApiError};