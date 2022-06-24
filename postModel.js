import mongoose from "mongoose";

const postModel = new mongoose.SchemaTypeOptions({
    user: String,
    imgName: String,
    text: String,
    avatar: String,
    timestamp: String,
});

export default mongoose.model('posts', postModel);