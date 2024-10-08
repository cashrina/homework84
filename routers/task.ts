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

taskRouter.get("/", async (req, res, next) => {
    try {
        const headerValueGet = req.get('Authorization');
        if (!headerValueGet) {
            return res.status(401).send({ error: 'Unauthorized: No token provided' });
        }

        const [_bearer, token] = headerValueGet.split(' ');
        if (!token) {
            return res.status(401).send({ error: 'Unauthorized: Token not found' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).send({ error: 'Unauthorized: Invalid token' });
        }

        const tasks = await Task.find({ user: user._id });

        return res.status(200).send(tasks);
    } catch (error) {
        return next(error);
    }
});

taskRouter.patch("/:id", async (req, res, next) => {
    try {
        const headerValuePatch = req.get('Authorization');
        if (!headerValuePatch) {
            return res.status(401).send({ error: 'Unauthorized: No token provided' });
        }

        const [_bearer, token] = headerValuePatch.split(' ');
        if (!token) {
            return res.status(401).send({ error: 'Unauthorized: Token not found' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).send({ error: 'Unauthorized: Invalid token' });
        }

        const taskId = req.params.id;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).send({ error: 'Task not found' });
        }

        if (!task.user.equals(user._id)) {
            return res.status(403).send({ error: 'Cannot edit someone' });
        }

        const { title, description, status } = req.body;
        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;

        const updatedTask = await task.save();

        return res.status(200).send(updatedTask);

    } catch (error) {
        return next(error);
    }
});

taskRouter.delete('/:id', async (req, res, next) => {
    try {
        const headerValueDelete = req.get('Authorization');
        if (!headerValueDelete) {
            return res.status(401).send({ error: 'Unauthorized: No token provided' });
        }

        const [_bearer, token] = headerValueDelete.split(' ');
        if (!token) {
            return res.status(401).send({ error: 'Unauthorized: Token not found' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).send({ error: 'Unauthorized: Invalid token' });
        }

        const taskId = req.params.id;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).send({ error: 'Not Found: Task does not exist' });
        }

        if (!task.user.equals(user._id)) {
            return res.status(403).send({ error: 'Forbidden: You do not delete' });
        }

        await Task.deleteOne({ _id: taskId });

        return res.status(204).send();

    } catch (error) {
        next(error);
    }
});

export default taskRouter;
