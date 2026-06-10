import mongoose from "mongoose";

const blacklistJwtTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, index: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '15d'
    }
});

export default mongoose.model('BlacklistJwtToken', blacklistJwtTokenSchema);