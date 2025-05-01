import { Router } from "express";
import authenticateLoginStatus from "../middlewares/checkJwtValidation.js";
import Habit from "../models/habitSchema.js"; // Adjust the path as necessary
import { ALL_DAYS, WEEKDAYS, HabitStatus } from '../constants.js';

const habitRouter = Router();
// Register route
habitRouter.post("/createHabit", authenticateLoginStatus, async (req, res) => {
    const { habitName, targetDays, customTargetDays = [], startDate } = req.body;
    const userId = req.userId;
    try {

        let finalCustomDays = [];

        if (targetDays === 'Every Day') {
            finalCustomDays = ALL_DAYS;
        } else if (targetDays === 'Weekdays') {
            finalCustomDays = WEEKDAYS;
        } else if (targetDays === 'Custom') {
            finalCustomDays = customTargetDays.filter(day => ALL_DAYS.includes(day));
        }

        // Create a new habit
        const habit = new Habit({
            user_id: userId,
            habitName,
            targetDays,
            customTargetDays: finalCustomDays,
            startDate,
            statusChangeTimestamp: new Date()
        });
        await habit.save();
        res.status(201).json({ message: "Habit created successfully", habit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Login route
habitRouter.delete("/removeHabit/:habitId", authenticateLoginStatus, async (req, res) => {
    const { habitId } = req.params;
    const userId = req.userId;
    try {
        const habit = await Habit.findOne({
            _id: habitId,
            user_id: userId // Verify that the habit belongs to the current user
        });

        if (!habit) {
            return res.status(404).json({ message: "Habit not found or you don't have permission to delete this habit" });
        }

        // Delete the habit
        await habit.deleteOne();

        res.status(200).json({ message: "Habit deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

habitRouter.put("/updateHabit", authenticateLoginStatus, async (req, res) => {
    const { habitId, newStatus } = req.body;  // Assume newStatus is passed in the request body
    const userId = req.userId;  // Extract userId from the JWT token

    try {
        // Find the habit by its ID and ensure it belongs to the user
        const habit = await Habit.findOne({
            _id: habitId,
            user_id: userId  // Ensure that the habit belongs to the logged-in user
        });

        if (!habit) {
            return res.status(404).json({ message: "Habit not found or you don't have permission to update this habit" });
        }

        // Update the habit's status and set the statusChangeTimestamp
        if(!Object.values(HabitStatus).includes(status)){
            return res.status(400).json({ message: "Invalid status provided" });
        }
        habit.status = newStatus;  // Update the status
        habit.statusChangeTimestamp = new Date();  // Set the current timestamp

        // Save the updated habit
        await habit.save();

        res.status(200).json({
            message: "Habit status updated successfully",
            habit
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

habitRouter.get("/getHabits", authenticateLoginStatus, async (req, res) => {
    const userId = req.userId;  // Extract the userId from the JWT token
    const { status, startDate, endDate } = req.query;  // Filters from query params

    try {
        // Build query object dynamically based on provided filters
        let filter = { user_id: userId };  // Start with the userId filter to ensure we fetch the user's habits

        // Add the status filter if provided
        if (status) {
            filter.status = status;  // Filter by status (e.g., 'ACTIVE', 'COMPLETED', 'MISSED')
        }

        // If the 'startDate' filter is provided, we will fetch habits for today or for specific dates
        if (startDate) {
            const today = new Date(startDate);
            today.setHours(0, 0, 0, 0); // Set to the start of the day (00:00:00)
            filter.startDate = { $gte: today };  // Filter habits that started today or later
        }

        // // If the 'endDate' filter is provided, we will fetch habits until the specified end date
        // if (endDate) {
        //     const end = new Date(endDate);
        //     end.setHours(23, 59, 59, 999);  // Set to the end of the day (23:59:59)
        //     filter.startDate = { $lte: end };  // Filter habits that started before the end date
        // }

        // Query the database with the constructed filter
        const habits = await Habit.find(filter);

        if (habits.length === 0) {
            return res.status(404).json({ message: "No habits found with the specified filters" });
        }
        res.status(200).json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export { habitRouter };
