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
        required: true
    }
    },
    {
    versionKey: false
    }
)

//"users" is a file name in the mongoDB
export default mongoose.model("users", schema)