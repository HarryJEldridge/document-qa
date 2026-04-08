/**
 * Confluence — fetches recently modified pages via REST API v1.
 * Requires: CONFLUENCE_BASE_URL, JIRA_EMAIL, CONFLUENCE_API_TOKEN
 * Note: CONFLUENCE_API_TOKEN can be the same as JIRA_API_TOKEN (same Atlassian account).
 */
import axios from 'axios';
import type { ConfluenceContext, ConfluencePage } from '../types/index';

interface ConfluenceVersion {
  when: string;
  by: { displayName?: string; username?: string };
}

interface ConfluenceSpace {
  name: string;
  key: string;
}

interface ConfluenceLinks {
  webui: string;
}

interface RawPage {
  id: string;
  title: string;
  space: ConfluenceSpace;
  version: ConfluenceVersion;
  _links: ConfluenceLinks;
}

function getClient(): { baseUrl: string; headers: Record<string, string> } {
  const { CONFLUENCE_BASE_URL, JIRA_EMAIL, CONFLUENCE_API_TOKEN, JIRA_API_TOKEN } =
    process.env;

  const token = CONFLUENCE_API_TOKEN ?? JIRA_API_TOKEN;
  if (!CONFLUENCE_BASE_URL || !JIRA_EMAIL || !token) {
    throw new Error(
      'CONFLUENCE_BASE_URL, JIRA_EMAIL, and CONFLUENCE_API_TOKEN (or JIRA_API_TOKEN) must be set'
    );
  }

  const encoded = Buffer.from(`${JIRA_EMAIL}:${token}`).toString('base64');
  return {
    baseUrl: CONFLUENCE_BASE_URL.replace(/\/$/, ''),
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
}

export async function fetchConfluence(): Promise<ConfluenceContext> {
  const { baseUrl, headers } = getClient();

  const { data } = await axios.get(
    `${baseUrl}/wiki/rest/api/content/search`,
    {
      headers,
      params: {
        cql: 'type = page AND space.type = global ORDER BY lastmodified DESC',
        limit: 10,
        expand: 'version,space',
      },
      timeout: 12_000,
    }
  );

  const recentPages: ConfluencePage[] = (data.results ?? []).map(
    (p: RawPage): ConfluencePage => ({
      id: p.id,
      title: p.title,
      space: p.space?.name ?? p.space?.key ?? '',
      lastModified: p.version?.when ?? '',
      author:
        p.version?.by?.displayName ?? p.version?.by?.username ?? 'Unknown',
      url: `${baseUrl}/wiki${p._links?.webui ?? ''}`,
    })
  );

  return { recentPages, fetchedAt: new Date().toISOString() };
}
