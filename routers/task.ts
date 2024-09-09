import Task from "../models/Task";
import User from "../models/User";
import mongoose from "mongoose";
import express from "express";

const taskRouter = express.Router();

taskRouter.post("/", async (req, res, next) => {
    try {
        const headerValue = req.get('Authorization');
        if (!headerValue) {
            return res.status(401).send({ error: 'Unauthorized: No token provided' });
        }

        const [_bearer, token] = headerValue.split(' ');
        if (!token) {
            return res.status(401).send({ error: 'Unauthorized: Token not found' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).send({ error: 'Unauthorized: Invalid token' });
        }

        const { title, description, status } = req.body;
        if (!title) {
            return res.status(400).send({ error: 'Bad Request: Task title is required' });
        }

        const taskBody = new Task({
            user: user._id,
            title,
            description,
            status,
        });

        await taskBody.save();
        return res.status(201).send(taskBody);

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).send(error);
        }
        next(error);
    }
});


export default taskRouter;
