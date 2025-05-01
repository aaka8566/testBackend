import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { userRouter } from './routes/authentication.js';
import { habitRouter } from './routes/habit.js';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// aakash8566
// rV2fjc9GQFDyjtCj
app.use("/authenticate", userRouter);
app.use("/habit", habitRouter);
app.get("/a",async(req,res)=>{
    res.send('Hello World');
})

const PORT = process.env.PORT || 5000;
console.log(`Server is running on port ${PORT}`);
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await mongoose.connect(process.env.MONGODB_URI, {})
        .then(() => console.log('✅ MongoDB Atlas connected'))
        .catch((err) => console.error('❌ MongoDB connection error:', err));
    console.log(`Server is running on port ${PORT}`);
    console.log(`MongoDB connected`);
})