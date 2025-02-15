const express = require("express");
const router = express.Router();
const Hoot = require("../models/hoot.js");
const verifyToken = require("../middleware/verify-token.js");

const isLowerCase = (str) => str === str.toLowerCase();

const checkBodyTitle = (req, res, next) => {
    if (isLowerCase(req.body?.text[0])) {
        return res.status(400).json({ err: "title needs to start with Capital" });
    }
    next();
};

router.post("/", verifyToken, async (req, res) => {
    try {
        if (isLowerCase(req.body.title[0])) {
            // res.send(400).json({ err: "1st letter in title needs to upper case" });
            // return;
            throw new Error("1st letter in title needs to upper case");
        }
        //? req.user comes from verifyToken
        req.body.author = req.user._id; //* getUser(req)
        const hoot = await Hoot.create(req.body);
        hoot._doc.author = req.user; //* partial populate

        // let tmp = await Hoot.create(req.body);
        // const hoot = await Hoot.findById(tmp._id).populate("author");

        //? hoot = { title: "tt", catgeory: "News", author: "SSS"}
        res.status(201).json({ hoot });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const hoots = await Hoot.find({})
            .populate("author")
            .sort({ createdAt: "asc" });
        res.json({ hoots }); //? res.json(hoots)
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.get("/:hootId", verifyToken, async (req, res) => {
    try {
        const { hootId } = req.params;
        const hoot = await Hoot.findById(hootId).populate([
            "author",
            "comments.author",
        ]);

        if (hoot === null) {
            return res.status(404).json({ err: "Not found" });
        }

        res.json({ hoot });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.put("/:hootId", verifyToken, async (req, res) => {
    try {
        const { hootId } = req.params;
        const hoot = await Hoot.findById(hootId);

        if (hoot === null) {
            return res.status(404).json({ err: "Not found" });
        }

        const isNotSameAuthor = !hoot.author.equals(req.user._id);
        if (isNotSameAuthor) {
            return res.status(403).json({ err: "You cannot do this" });
        }

        const updatedHoot = await Hoot.findByIdAndUpdate(hootId, req.body, {
            new: true,
            runValidators: true,
        });
        updatedHoot._doc.author = req.user;
        res.json({ hoot: updatedHoot });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.delete("/:hootId", async (req, res) => {
    try {
        const { hootId } = req.params;
        const hoot = await Hoot.findById(hootId);

        if (hoot === null) {
            return res.status(404).json({ err: "Not found" });
        }

        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        const deletedHoot = await Hoot.findByIdAndDelete(hootId);
        res.json({ hoot: deletedHoot });
        //* res.status(204).send()
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.post("/:hootId/comments", verifyToken, async (req, res) => {
    try {
        //? Hint: embedded -> work with parent Hoot
        const { hootId } = req.params;
        const hoot = await Hoot.findById(hootId);

        //? check errors?
        req.body.author = req.user._id;
        //? modify the hoot directly using JS
        hoot.comments.push(req.body);
        await hoot.save();

        const newComment = hoot.comments[hoot.comments.length - 1];
        newComment._doc.author = req.user;

        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

//? inputs -> info that you need
router.delete("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
    try {
        const { hootId, commentId } = req.params;

        //* doc from mongoose (findById) -> JS object enhanced -> Mongoose doc
        const hoot = await Hoot.findById(hootId);
        const comment = hoot.comments.id(commentId);
        // const c = hoot.comments.find((x) => x._id.toString() === commentId);

        if (comment.author._id.toString() !== req.user._id) {
            return res
                .status(403)
                .json({ message: "You are not authorized to delete this comment" });
        }

        hoot.comments.remove({ _id: commentId });
        hoot.save();

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.put(
    "/:hootId/comments/:commentId",
    [verifyToken, checkBodyTitle],
    async (req, res) => {
        try {
            const { hootId, commentId } = req.params;

            const hoot = await Hoot.findById(hootId);
            const comment = hoot.comments.id(commentId);

            if (comment.author._id.toString() !== req.user._id) {
                return res
                    .status(403)
                    .json({ message: "You are not authorized to edit this comment" });
            }

            comment.text = req.body.text;
            await hoot.save();

            comment._doc.author = req.user;
            res.json({ hoot });
        } catch (err) {
            res.status(500).json({ err: err.message });
        }
    }
);

module.exports = router;