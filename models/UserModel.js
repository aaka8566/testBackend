import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_id:{
        type: String,
        required: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name must be less than 50 characters'],
    },
    username: {
        type: String,
        required: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name must be less than 50 characters'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function (v) {
                // At least one letter and one number
                return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);
            },
            message:
                'Password must be at least 8 characters and include at least one letter and one number',
        },
    },
    phoneNumber: {
        type: Number,
        required: true,
        match: [/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian number'],
    },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;