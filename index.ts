import express from "express";
import usersRouter from "./routers/users";
import cors from 'cors';
import config from "./config";
import mongoose from "mongoose";
import taskRouter from "./routers/task";


const app = express();
const port = 8000;

app.use(cors(config.corsOptions));
app.use(express.json());
app.use(express.static('public'));
app.use('/users', usersRouter);
app.use('/tasks', taskRouter)

const run = async () => {
    await mongoose.connect(config.database);
    app.listen(port, () => {
        console.log(`Server started on ${port} port!`);
    });

    process.on('exit', () => {
        mongoose.disconnect();
    });
};

run().catch(console.error);