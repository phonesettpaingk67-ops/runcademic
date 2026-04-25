/**
 * GitHub API client wrapper
 * Uses the authenticated user's access token for API calls
 */

export class GitHubClient {
  constructor(accessToken) {
    if (!accessToken) {
      throw new Error('GitHub access token is required');
    }
    this.accessToken = accessToken;
    this.baseURL = 'https://api.github.com';
  }

  private async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `token ${this.accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user repositories
   */
  async getRepositories() {
    return this.request('/user/repos?sort=updated&per_page=100');
  }

  /**
   * Get repository details
   */
  async getRepository(owner, repo) {
    return this.request(`/repos/${owner}/${repo}`);
  }

  /**
   * Create a new repository
   */
  async createRepository(name, options = {}) {
    return this.request('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: options.description || '',
        private: options.private || false,
        ...options,
      }),
    });
  }

  /**
   * Get pull requests
   */
  async getPullRequests(owner, repo, state = 'open') {
    return this.request(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=50`);
  }

  /**
   * Create a pull request
   */
  async createPullRequest(owner, repo, data) {
    return this.request(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get issues
   */
  async getIssues(owner, repo, state = 'open') {
    return this.request(`/repos/${owner}/${repo}/issues?state=${state}&per_page=50`);
  }

  /**
   * Create an issue
   */
  async createIssue(owner, repo, data) {
    return this.request(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get user info
   */
  async getUserInfo() {
    return this.request('/user');
  }

  /**
   * Search repositories
   */
  async searchRepositories(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      sort: options.sort || 'stars',
      order: options.order || 'desc',
      per_page: options.perPage || 30,
    });
    return this.request(`/search/repositories?${params}`);
  }
}

export default GitHubClient;
