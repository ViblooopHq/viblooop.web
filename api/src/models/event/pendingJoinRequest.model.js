import mongoose from "mongoose";
import { PENDING_JOIN_REQUEST_STATUS } from "../../constants/constant.js";

const PendingJoinRequestSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Events",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: [PENDING_JOIN_REQUEST_STATUS.PENDING, PENDING_JOIN_REQUEST_STATUS.ACCEPTED, PENDING_JOIN_REQUEST_STATUS.REJECTED],
        default: PENDING_JOIN_REQUEST_STATUS.PENDING
    }
}, { timestamps: true });

PendingJoinRequestSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const PendingJoinRequest = mongoose.model("PendingJoinRequest", PendingJoinRequestSchema);

export default PendingJoinRequest;