import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    subscribe: {
        type: Boolean,
        required: false
    }
    },
    {
    versionKey: false
    }
)

export default mongoose.model("Post", schema)