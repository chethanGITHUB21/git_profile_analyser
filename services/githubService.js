const axios = require("axios");
const model = require("../models/githubModel");
const pool = require("../database/db");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const getHeaders = () =>
  GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};

const toMysqlDateTime = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toISOString().slice(0, 19).replace("T", " ");
};

const normalizeGithubError = (err) => {
  if (!err.response) return err;

  const error = new Error(
    `GitHub API error: ${err.response.statusText || "Error"}`,
  );
  error.status = err.response.status;
  error.details = err.response.data;
  return error;
};

exports.fetchProfile = async (username) => {
  const url = `https://api.github.com/users/${username}`;
  try {
    const resp = await axios.get(url, { headers: getHeaders() });
    return model.parseProfile(resp.data);
  } catch (err) {
    throw normalizeGithubError(err);
  }
};

exports.fetchProfileRepos = async (username, repository) => {
  // If a specific repository name is provided, fetch that repo,
  // otherwise fetch the user's repos list.
  const url = repository
    ? `https://api.github.com/repos/${username}/${repository}`
    : `https://api.github.com/users/${username}/repos`;
  const resp = await axios.get(url, { headers: getHeaders() });
  // resp.data may be an array (list of repos) or an object (single repo)
  if (Array.isArray(resp.data)) return model.parseRepositories(resp.data);
  return model.parseRepository(resp.data);
};

const fetchAllProfileRepos = async (username) => {
  const repositories = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`;
    const resp = await axios.get(url, { headers: getHeaders() });
    repositories.push(...resp.data);

    if (resp.data.length < 100) break;
    page += 1;
  }

  return model.parseRepositories(repositories);
};

const upsertProfileData = async (profile, repositories) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      `INSERT INTO users (
        github_id,
        username,
        name,
        bio,
        company,
        location,
        followers,
        following,
        public_repos,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        username = VALUES(username),
        name = VALUES(name),
        bio = VALUES(bio),
        company = VALUES(company),
        location = VALUES(location),
        followers = VALUES(followers),
        following = VALUES(following),
        public_repos = VALUES(public_repos),
        created_at = VALUES(created_at),
        updated_at = VALUES(updated_at)`,
      [
        profile.id,
        profile.login,
        profile.name,
        profile.bio,
        profile.company,
        profile.location,
        profile.followers,
        profile.following,
        profile.public_repos,
        toMysqlDateTime(profile.created_at),
        toMysqlDateTime(profile.updated_at),
      ],
    );

    const userId = userResult.insertId;
    const repoIds = repositories.map((repo) => repo.id).filter(Boolean);

    for (const repo of repositories) {
      await connection.query(
        `INSERT INTO repository (
          repo_id,
          user_id,
          name,
          language,
          stars,
          forks,
          watchers,
          is_private,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          user_id = VALUES(user_id),
          name = VALUES(name),
          language = VALUES(language),
          stars = VALUES(stars),
          forks = VALUES(forks),
          watchers = VALUES(watchers),
          is_private = VALUES(is_private),
          created_at = VALUES(created_at),
          updated_at = VALUES(updated_at)`,
        [
          repo.id,
          userId,
          repo.name,
          repo.language,
          repo.stargazers_count,
          repo.forks_count,
          repo.watchers_count,
          repo.private,
          toMysqlDateTime(repo.created_at),
          toMysqlDateTime(repo.updated_at),
        ],
      );
    }

    if (repoIds.length) {
      await connection.query(
        "DELETE FROM repository WHERE user_id = ? AND repo_id NOT IN (?)",
        [userId, repoIds],
      );
    } else {
      await connection.query("DELETE FROM repository WHERE user_id = ?", [
        userId,
      ]);
    }

    await connection.commit();
    return userId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.getProfileInsights = async (username) => {
  const profile = await exports.fetchProfile(username);
  const repositories = await fetchAllProfileRepos(username);
  const userId = await upsertProfileData(profile, repositories);

  const [rows] = await pool.query(
    `SELECT
      insights.user_id,
      insights.github_id,
      insights.username,
      insights.followers,
      insights.following,
      insights.public_repos,
      insights.repository_count,
      insights.total_stars,
      insights.total_forks,
      insights.total_watchers,
      insights.average_stars_per_repo,
      insights.follower_following_ratio,
      insights.account_age,
      primary_language.primary_language,
      primary_language.language_percentage AS primary_language_percentage,
      activity.latest_repository_created_at,
      activity.latest_repository_updated_at,
      activity.first_repository_created_at,
      activity.public_repository_count,
      activity.private_repository_count
    FROM vw_user_repository_insights insights
    LEFT JOIN vw_user_primary_language primary_language
      ON primary_language.user_id = insights.user_id
    LEFT JOIN vw_user_repository_activity activity
      ON activity.user_id = insights.user_id
    WHERE insights.user_id = ?`,
    [userId],
  );

  return rows[0];
};

exports.fetchProfileFollowers = async (username) => {
  const url = `https://api.github.com/users/${username}/followers`;
  try {
    const resp = await axios.get(url, { headers: getHeaders() });
    return model.parseFollowers(resp.data);
  } catch (err) {
    throw normalizeGithubError(err);
  }
};

exports.fetchProfileFollowing = async (username) => {
  const url = `https://api.github.com/users/${username}/following`;
  try {
    const resp = await axios.get(url, { headers: getHeaders() });
    return model.parseFollowing(resp.data);
  } catch (err) {
    throw normalizeGithubError(err);
  }
};
