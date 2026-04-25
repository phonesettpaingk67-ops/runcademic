import express from 'express';
import LinearClient from '../lib/linearClient.js';

const router = express.Router();

/**
 * Create a new Linear issue
 */
router.post('/issues', (req, res) => {
  try {
    const { teamId, title, description, priority } = req.body;

    if (!process.env.LINEAR_API_KEY) {
      return res.status(500).json({ error: 'Linear API key not configured' });
    }

    const linear = new LinearClient(process.env.LINEAR_API_KEY);
    const issue = linear.createIssue(teamId, {
      title,
      description,
      priority,
    });

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get issues for a team
 */
router.get('/issues/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { state } = req.query;

    if (!process.env.LINEAR_API_KEY) {
      return res.status(500).json({ error: 'Linear API key not configured' });
    }

    const linear = new LinearClient(process.env.LINEAR_API_KEY);
    const issues = await linear.getIssues(teamId, state || 'started');

    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update issue status
 */
router.put('/issues/:issueId/status', async (req, res) => {
  try {
    const { issueId } = req.params;
    const { stateId } = req.body;

    if (!process.env.LINEAR_API_KEY) {
      return res.status(500).json({ error: 'Linear API key not configured' });
    }

    const linear = new LinearClient(process.env.LINEAR_API_KEY);
    const issue = await linear.updateIssueStatus(issueId, stateId);

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Link issue to GitHub PR
 */
router.post('/issues/:issueId/link-pr', async (req, res) => {
  try {
    const { issueId } = req.params;
    const { prUrl } = req.body;

    if (!process.env.LINEAR_API_KEY) {
      return res.status(500).json({ error: 'Linear API key not configured' });
    }

    const linear = new LinearClient(process.env.LINEAR_API_KEY);
    const issue = await linear.linkIssueToPR(issueId, prUrl);

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
