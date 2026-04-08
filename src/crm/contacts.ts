import db from '../db/client';
import type { Contact } from './schema';

type DbRow = Record<string, unknown>;

function rowToContact(row: DbRow): Contact {
  return {
    id: row.id as number,
    name: row.name as string,
    role: (row.role as string | null) ?? undefined,
    company: (row.company as string | null) ?? undefined,
    email: (row.email as string | null) ?? undefined,
    phone: (row.phone as string | null) ?? undefined,
    relationship: (row.relationship as Contact['relationship'] | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    lastContacted: (row.last_contacted as string | null) ?? undefined,
    tags: row.tags ? (row.tags as string).split(',').filter(Boolean) : [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function getContact(id: number): Contact | undefined {
  const row = db
    .prepare('SELECT * FROM crm_contacts WHERE id = ?')
    .get(id) as DbRow | undefined;
  return row ? rowToContact(row) : undefined;
}

export function listContacts(): Contact[] {
  const rows = db
    .prepare('SELECT * FROM crm_contacts ORDER BY name ASC')
    .all() as DbRow[];
  return rows.map(rowToContact);
}

export function searchContacts(query: string): Contact[] {
  const like = `%${query}%`;
  const rows = db
    .prepare(
      'SELECT * FROM crm_contacts WHERE name LIKE ? OR company LIKE ? OR email LIKE ? ORDER BY name ASC'
    )
    .all(like, like, like) as DbRow[];
  return rows.map(rowToContact);
}

export function upsertContact(contact: Contact): Contact {
  const tags = contact.tags?.join(',') ?? null;

  if (contact.id) {
    db.prepare(`
      UPDATE crm_contacts
      SET name = ?, role = ?, company = ?, email = ?, phone = ?,
          relationship = ?, notes = ?, last_contacted = ?, tags = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      contact.name,
      contact.role ?? null,
      contact.company ?? null,
      contact.email ?? null,
      contact.phone ?? null,
      contact.relationship ?? null,
      contact.notes ?? null,
      contact.lastContacted ?? null,
      tags,
      contact.id
    );
    return getContact(contact.id)!;
  }

  const result = db
    .prepare(`
      INSERT INTO crm_contacts
        (name, role, company, email, phone, relationship, notes, last_contacted, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      contact.name,
      contact.role ?? null,
      contact.company ?? null,
      contact.email ?? null,
      contact.phone ?? null,
      contact.relationship ?? null,
      contact.notes ?? null,
      contact.lastContacted ?? null,
      tags
    );

  return getContact(result.lastInsertRowid as number)!;
}

export function deleteContact(id: number): void {
  db.prepare('DELETE FROM crm_contacts WHERE id = ?').run(id);
}
