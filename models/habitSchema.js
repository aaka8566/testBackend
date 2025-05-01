// models/Habit.js
import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User collection
        required: true,
    },
    habitName: {
        type: String,
        required: true,
    },
    targetDays: {
        type: String,  // e.g., 'Every Day', 'Weekdays', 'Custom'
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    customTargetDays: {
        type: [String], // e.g., ['Monday', 'Wednesday']
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: [],
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'MISSED' , 'ACTIVE'],
        default: 'ACTIVE',
    },
    statusChangeTimestamp: {
        type: Date
    },
},{ timestamps: true });

const Habit = mongoose.model("Habit", habitSchema);
export default Habit;
