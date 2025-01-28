import { asyncHandler } from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (_, res) => {
    res.status(200).json({ status: "ok", message: "Service is up and running" });
});


export {
    healthcheck
}
