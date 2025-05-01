import mongoose from "mongoose";

const jwtAccessSchema = new mongoose.Schema({
    user_id:{
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        unique: true,
    },
    lastLogin: {
        type: Date, // Timestamp for the last login time
        default: Date.now,
    },
    lastLogout: {
        type: Date, // Timestamp for the last logout time
    }
}, { timestamps: true });
const jwtAccess = mongoose.model("jwtAccess", jwtAccessSchema);
export default jwtAccess;