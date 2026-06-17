CREATE DATABASE IF NOT EXISTS github_profile_analyser
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

USE github_profile_analyser;

DROP VIEW IF EXISTS vw_user_repository_activity;
DROP VIEW IF EXISTS vw_user_primary_language;
DROP VIEW IF EXISTS vw_user_language_stats;
DROP VIEW IF EXISTS vw_user_repository_insights;

DROP TABLE IF EXISTS github_insights;
DROP TABLE IF EXISTS followings;
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS repos;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS repository;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  github_id BIGINT NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255),
  bio TEXT,
  company VARCHAR(200),
  location VARCHAR(255),
  followers INT NOT NULL DEFAULT 0,
  following INT NOT NULL DEFAULT 0,
  public_repos INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_users_username (username),
  INDEX idx_users_github_id (github_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE repository (
  repo_id BIGINT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  language VARCHAR(200),
  stars INT NOT NULL DEFAULT 0,
  forks INT NOT NULL DEFAULT 0,
  watchers INT NOT NULL DEFAULT 0,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_repository_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_repository_user_id (user_id),
  INDEX idx_repository_language (language),
  INDEX idx_repository_stars (stars),
  INDEX idx_repository_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE VIEW vw_user_repository_insights AS
SELECT
  u.id AS user_id,
  u.github_id,
  u.username,
  u.followers,
  u.following,
  u.public_repos,
  COUNT(r.repo_id) AS repository_count,
  COALESCE(SUM(r.stars), 0) AS total_stars,
  COALESCE(SUM(r.forks), 0) AS total_forks,
  COALESCE(SUM(r.watchers), 0) AS total_watchers,
  COALESCE(AVG(r.stars), 0) AS average_stars_per_repo,
  ROUND(u.followers / (u.following + 1), 2) AS follower_following_ratio,
  TIMESTAMPDIFF(YEAR, u.created_at, CURRENT_DATE) AS account_age
FROM users u
LEFT JOIN repository r ON r.user_id = u.id
GROUP BY
  u.id,
  u.github_id,
  u.username,
  u.followers,
  u.following,
  u.public_repos,
  u.created_at;

CREATE VIEW vw_user_language_stats AS
SELECT
  u.id AS user_id,
  u.username,
  r.language,
  COUNT(*) AS repository_count,
  ROUND((COUNT(*) / NULLIF(total_repos.total_count, 0)) * 100, 2) AS language_percentage
FROM users u
JOIN repository r ON r.user_id = u.id
JOIN (
  SELECT user_id, COUNT(*) AS total_count
  FROM repository
  GROUP BY user_id
) total_repos ON total_repos.user_id = u.id
WHERE r.language IS NOT NULL
GROUP BY u.id, u.username, r.language, total_repos.total_count;

CREATE VIEW vw_user_primary_language AS
SELECT
  ranked.user_id,
  ranked.username,
  ranked.language AS primary_language,
  ranked.repository_count,
  ranked.language_percentage
FROM (
  SELECT
    language_stats.*,
    ROW_NUMBER() OVER (
      PARTITION BY language_stats.user_id
      ORDER BY language_stats.repository_count DESC, language_stats.language ASC
    ) AS language_rank
  FROM vw_user_language_stats language_stats
) ranked
WHERE ranked.language_rank = 1;

CREATE VIEW vw_user_repository_activity AS
SELECT
  u.id AS user_id,
  u.username,
  MAX(r.created_at) AS latest_repository_created_at,
  MAX(r.updated_at) AS latest_repository_updated_at,
  MIN(r.created_at) AS first_repository_created_at,
  COUNT(CASE WHEN r.is_private = FALSE THEN 1 END) AS public_repository_count,
  COUNT(CASE WHEN r.is_private = TRUE THEN 1 END) AS private_repository_count
FROM users u
LEFT JOIN repository r ON r.user_id = u.id
GROUP BY u.id, u.username;
