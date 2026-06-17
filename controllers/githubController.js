const services = require("../services/githubService");
const asyncHandler = require("../utils/asyncHandler");

module.exports = {
  getProfile: asyncHandler(async (req, res) => {
    const username = req.params.username;
    const profile = await services.fetchProfile(username);
    res.json(profile);
  }),

  getRepository: asyncHandler(async (req, res) => {
    const username = req.params.username;
    const repository = req.params.repository;
    const repos = await services.fetchProfileRepos(username, repository);
    res.json(repos);
  }),

  getFollowers: asyncHandler(async (req, res) => {
    const username = req.params.username;
    const followers = await services.fetchProfileFollowers(username);
    res.json(followers);
  }),

  getFollowing: asyncHandler(async (req, res) => {
    const username = req.params.username;
    const following = await services.fetchProfileFollowing(username);
    res.json(following);
  }),

  getInsights: asyncHandler(async (req, res) => {
    const username = req.params.username;
    const insights = await services.getProfileInsights(username);
    res.json(insights);
  }),
};
