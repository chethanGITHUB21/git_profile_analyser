const express = require("express");
const router = express.Router();
const controller = require("../controllers/githubController");

router.get("/profile/:username", controller.getProfile);
router.get("/profile/:username/repos", controller.getRepository);
router.get("/profile/:username/followers", controller.getFollowers);
router.get("/profile/:username/following", controller.getFollowing);
router.get("/profile/:username/insights", controller.getInsights);
router.get("/profile/:username/:repository", controller.getRepository);

module.exports = router;
