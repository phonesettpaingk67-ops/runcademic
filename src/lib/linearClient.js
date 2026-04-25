/**
 * Linear API client wrapper using MCP
 * Integrates with Linear for task/issue management
 */

export class LinearClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Linear API key is required');
    }
    this.apiKey = apiKey;
    this.baseURL = 'https://api.linear.app/graphql';
  }

  async #query(graphqlQuery, variables = {}) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`Linear GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  }

  /**
   * Create a new Linear issue
   */
  async createIssue(teamId, data) {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          issue {
            id
            identifier
            title
            description
            state {
              name
            }
            priority
            assignee {
              name
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        teamId,
        title: data.title,
        description: data.description || '',
        priority: data.priority || 0,
        ...data,
      },
    };

    return this.#query(mutation, variables);
  }

  /**
   * Get all issues in a team
   */
  async getIssues(teamId, state = 'started') {
    const query = `
      query GetIssues($teamId: String, $state: String) {
        issues(
          filter: {
            team: { id: { eq: $teamId } }
            state: { name: { eq: $state } }
          }
          first: 50
        ) {
          nodes {
            id
            identifier
            title
            description
            state {
              name
            }
            priority
            assignee {
              name
            }
          }
        }
      }
    `;

    const variables = {
      teamId,
      state,
    };

    return this.#query(query, variables);
  }

  /**
   * Update an issue status
   */
  async updateIssueStatus(issueId, stateId) {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          issue {
            id
            identifier
            title
            state {
              name
            }
          }
        }
      }
    `;

    const variables = {
      id: issueId,
      input: {
        stateId,
      },
    };

    return this.#query(mutation, variables);
  }

  /**
   * Get user info
   */
  async getUserInfo() {
    const query = `
      query {
        viewer {
          id
          name
          email
        }
      }
    `;

    return this.#query(query);
  }

  /**
   * Link issue to GitHub PR
   */
  async linkIssueToPR(issueId, prUrl) {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          issue {
            id
            identifier
          }
        }
      }
    `;

    const variables = {
      id: issueId,
      input: {
        description: `PR: ${prUrl}`,
      },
    };

    return this.#query(mutation, variables);
  }
}

export default LinearClient;
