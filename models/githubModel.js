// Simple profile parser placeholder

module.exports = {
  parseProfile: async (raw) => {
    if (!raw) return {};
    return {
      login: raw.login || null,
      id: raw.id || null,
      avatar_url: raw.avatar_url || null,
      url: raw.url || null,
      repos_url: raw.repos_url || null,
      followers_url: raw.followers_url || null,
      following_url: raw.following_url || null,
      site_admin: raw.site_admin || false,
      name: raw.name || null,
      bio: raw.bio || null,
      company: raw.company || null,
      email: raw.email || null,
      location: raw.location || null,
      public_repos: raw.public_repos || 0,
      followers: raw.followers || 0,
      following: raw.following || 0,
      created_at: raw.created_at || null,
      updated_at: raw.updated_at || null,
      html_url: raw.html_url || null,
    };
  },

  parseRepository: async (raw) => {
    if (!raw) return {};
    return {
      id: raw.id || null,
      name: raw.name || null,
      full_name: raw.full_name || null,
      html_url: raw.html_url || raw.url || null,
      description: raw.description || null,
      private: raw.private || false,
      fork: raw.fork || false,
      stargazers_count: raw.stargazers_count || 0,
      forks_count: raw.forks_count || 0,
      watchers_count: raw.watchers_count || raw.watchers || 0,
      language: raw.language || null,
      created_at: raw.created_at || null,
      updated_at: raw.updated_at || null,
    };
  },

  parseRepositories: (raw) => {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((r) => ({
      id: r.id || null,
      name: r.name || null,
      full_name: r.full_name || null,
      html_url: r.html_url || r.url || null,
      description: r.description || null,
      stargazers_count: r.stargazers_count || 0,
      forks_count: r.forks_count || 0,
      watchers_count: r.watchers_count || r.watchers || 0,
      language: r.language || null,
      private: r.private || false,
      created_at: r.created_at || null,
      updated_at: r.updated_at || null,
    }));
  },

  parseFollowers: (raw) => {
    // followers endpoint returns an array of user objects
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((u) => ({
        login: u.login || null,
        id: u.id || null,
        avatar_url: u.avatar_url || null,
        html_url: u.html_url || u.url || null,
        followers_url: u.followers_url || (u.url ? `${u.url}/followers` : null),
        // following_url: u.following_url || (u.url ? `${u.url}/following` : null),
        followers_count: typeof u.followers === "number" ? u.followers : null,
        // following_count: typeof u.following === 'number' ? u.following : null,
      }));
    }
    // fallback single object
    return [
      {
        login: raw.login || null,
        id: raw.id || null,
        avatar_url: raw.avatar_url || null,
        html_url: raw.html_url || raw.url || null,
        followers_url:
          raw.followers_url || (raw.url ? `${raw.url}/followers` : null),
        // following_url: raw.following_url || (raw.url ? `${raw.url}/following` : null),
        followers_count:
          typeof raw.followers === "number" ? raw.followers : null,
        // following_count: typeof raw.following === 'number' ? raw.following : null,
      },
    ];
  },

  parseFollowing: (raw) => {
    // following endpoint returns an array of user objects
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((u) => ({
        login: u.login || null,
        id: u.id || null,
        avatar_url: u.avatar_url || null,
        html_url: u.html_url || u.url || null,
        // followers_url: u.followers_url || (u.url ? `${u.url}/followers` : null),
        following_url: u.following_url || (u.url ? `${u.url}/following` : null),
        // followers_count: typeof u.followers === 'number' ? u.followers : null,
        following_count: typeof u.following === "number" ? u.following : null,
      }));
    }
    // fallback single object
    return [
      {
        login: raw.login || null,
        id: raw.id || null,
        avatar_url: raw.avatar_url || null,
        html_url: raw.html_url || raw.url || null,
        // followers_url: raw.followers_url || (raw.url ? `${raw.url}/followers` : null),
        following_url:
          raw.following_url || (raw.url ? `${raw.url}/following` : null),
        // followers_count: typeof raw.followers === 'number' ? raw.followers : null,
        following_count:
          typeof raw.following === "number" ? raw.following : null,
      },
    ];
  },
};
