import mongoose, {Types} from "mongoose";
import User from "./User";

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: async (value: Types.ObjectId) => {
            const user = await User.findById(value);
            return Boolean(user);
        },
        message: 'User doesnt find',
    },

    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
    },

    status: {
        type: String,
        enum: ['new', 'in_progress', 'complete'],
        default: 'new',
    }
});

const Task = mongoose.model("Task", TaskSchema);
export default Task;