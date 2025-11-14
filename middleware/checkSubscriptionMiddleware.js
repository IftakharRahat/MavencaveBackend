const Enrollment = require("../models/enrollmentModel.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const mongoose = require("mongoose");

const checkSubscription = asyncHandler(async (req, _, next) => {
    const { courseId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new ApiError(400, "Invalid Course ID format.");
    }
    if (!userId) {
        throw new ApiError(401, "User not authenticated.");
    }

    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
    });

    if (!enrollment) {
        throw new ApiError(
            403,
            "Access Denied. You are not enrolled in this course."
        );
    }

    req.enrollment = enrollment;
    next();
});

module.exports = { checkSubscription };