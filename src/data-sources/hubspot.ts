/**
 * HubSpot CRM — fetches open deals and pending tasks.
 * Requires: HUBSPOT_API_KEY (private app token from Settings > Integrations > Private Apps)
 */
import axios from 'axios';
import type { HubSpotContext, HubSpotDeal, HubSpotTask } from '../types/index';

const BASE = 'https://api.hubapi.com';

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` };
}

type HsObject = {
  id: string;
  properties: Record<string, string | null>;
};

async function fetchDeals(): Promise<HubSpotDeal[]> {
  const { data } = await axios.get(`${BASE}/crm/v3/objects/deals`, {
    headers: authHeaders(),
    params: {
      limit: 20,
      properties: [
        'dealname',
        'dealstage',
        'amount',
        'closedate',
        'hs_lastmodifieddate',
        'associations.company',
      ].join(','),
      sort: '-hs_lastmodifieddate',
    },
    timeout: 10_000,
  });

  return (data.results ?? []).map((d: HsObject): HubSpotDeal => ({
    id: d.id,
    name: d.properties.dealname ?? 'Untitled',
    stage: d.properties.dealstage ?? 'unknown',
    amount: d.properties.amount
      ? parseFloat(d.properties.amount)
      : undefined,
    closeDate: d.properties.closedate ?? undefined,
    lastActivity: d.properties.hs_lastmodifieddate ?? undefined,
  }));
}

async function fetchTasks(): Promise<HubSpotTask[]> {
  const { data } = await axios.post(
    `${BASE}/crm/v3/objects/tasks/search`,
    {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'hs_task_status',
              operator: 'NEQ',
              value: 'COMPLETED',
            },
          ],
        },
      ],
      properties: [
        'hs_task_subject',
        'hs_task_type',
        'hs_task_status',
        'hs_timestamp',
      ],
      limit: 20,
      sorts: [{ propertyName: 'hs_timestamp', direction: 'ASCENDING' }],
    },
    { headers: authHeaders(), timeout: 10_000 }
  );

  return (data.results ?? []).map((t: HsObject): HubSpotTask => ({
    id: t.id,
    title: t.properties.hs_task_subject ?? 'Untitled task',
    status: t.properties.hs_task_status ?? 'UNKNOWN',
    dueDate: t.properties.hs_timestamp ?? undefined,
    type: t.properties.hs_task_type ?? 'TASK',
  }));
}

export async function fetchHubSpot(): Promise<HubSpotContext> {
  if (!process.env.HUBSPOT_API_KEY) {
    throw new Error('HUBSPOT_API_KEY not set');
  }

  const [deals, tasks] = await Promise.all([
    fetchDeals().catch((): HubSpotDeal[] => []),
    fetchTasks().catch((): HubSpotTask[] => []),
  ]);

  return { deals, tasks, fetchedAt: new Date().toISOString() };
}
