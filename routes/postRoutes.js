const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const postController = require("../controllers/postController");

router.route("/")
    .get(authMiddleware, postController.getAllPosts)
    .post(authMiddleware, postController.createPost);

router.route("/:id")
    .get(authMiddleware, postController.getOnePost)
    .patch(authMiddleware, postController.updatePost)
    .delete(authMiddleware, postController.deletePost);

module.exports = router;
