const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());

const githubRoutes = require("./routes/githubRoutes");
app.use("/api/github", githubRoutes);

// basic health
app.get("/", (req, res) =>
  res.send(
    "Server is listening on gitprofileanalyser-production.up.railway.app",
  ),
);

// error handler (should be after all routes)
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
