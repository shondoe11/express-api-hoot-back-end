const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        author: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const hootSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["News", "Sports", "Games", "Movies", "Music", "Television"],
        },
        //* referencing
        author: { type: Schema.Types.ObjectId, ref: "User" },
        //* embedding -> as array because []
        comments: [commentSchema],
    },
    { timestamps: true }
);

module.exports = model("Hoot", hootSchema);