/**
 * Jira — fetches issues assigned to current user via REST API v3.
 * Requires: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN
 * Example: JIRA_BASE_URL=https://yourcompany.atlassian.net
 */
import axios from 'axios';
import type { JiraContext, JiraIssue } from '../types/index';

interface JiraFields {
  summary: string;
  status: { name: string };
  priority: { name: string } | null;
  project: { name: string };
  updated: string;
  duedate: string | null;
  assignee: { displayName: string } | null;
  labels: string[];
}

interface RawJiraIssue {
  key: string;
  fields: JiraFields;
}

function getClient(): { baseUrl: string; headers: Record<string, string> } {
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    throw new Error(
      'JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN must all be set'
    );
  }

  const token = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString(
    'base64'
  );
  return {
    baseUrl: JIRA_BASE_URL.replace(/\/$/, ''),
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
}

function mapIssue(issue: RawJiraIssue): JiraIssue {
  const { fields } = issue;
  return {
    key: issue.key,
    summary: fields.summary ?? '',
    status: fields.status?.name ?? 'Unknown',
    priority: fields.priority?.name ?? 'None',
    project: fields.project?.name ?? '',
    updated: fields.updated ?? '',
    dueDate: fields.duedate ?? undefined,
    assignee: fields.assignee?.displayName ?? undefined,
    labels: fields.labels ?? [],
  };
}

export async function fetchJira(): Promise<JiraContext> {
  const { baseUrl, headers } = getClient();

  // Fetch issues assigned to me, not done, ordered by most recently updated
  const jql =
    'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC';

  const { data } = await axios.get(`${baseUrl}/rest/api/3/search`, {
    headers,
    params: {
      jql,
      maxResults: 25,
      fields:
        'summary,status,priority,project,updated,duedate,assignee,labels',
    },
    timeout: 12_000,
  });

  const assignedIssues: JiraIssue[] = (data.issues ?? []).map(mapIssue);

  return { assignedIssues, fetchedAt: new Date().toISOString() };
}
