/**
 * Apple Reminders — fetches via AppleScript (macOS only).
 * Returns empty lists gracefully on non-macOS platforms.
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import type { RemindersContext, ReminderItem } from '../types/index';

const execAsync = promisify(exec);

const LISTS = [
  { id: 'AD2A476E-420D-4B8C-8856-BB0DEB1D518A', name: 'Daily Briefing' },
  { id: '603D0B69-A927-464C-B6F3-A7E068F5F106', name: 'GTM Engineering' },
  { id: 'C1D699B2-18E7-4BFC-BBAE-6C4D0805E3D9', name: 'Certifications' },
  { id: '89953772-8058-47C1-8B0F-44B46D1DFABC', name: 'Matt K' },
] as const;

function buildScript(): string {
  const ids = LISTS.map((l) => `"${l.id}"`).join(', ');
  return `
set targetIds to {${ids}}
set output to {}

tell application "Reminders"
  repeat with aList in lists
    set listId to id of aList
    set isTarget to false
    repeat with tid in targetIds
      if listId is equal to tid then
        set isTarget to true
        exit repeat
      end if
    end repeat

    if isTarget then
      set listName to name of aList
      repeat with r in reminders of aList
        if completed of r is false then
          set theTitle to name of r
          set theDue to ""
          try
            set theDue to due date of r as string
          end try
          set thePriority to priority of r as string
          set end of output to listName & "|||" & theTitle & "|||" & theDue & "|||" & thePriority
        end if
      end repeat
    end if
  end repeat
end tell

set AppleScript's text item delimiters to "\\n"
return output as text
`;
}

export async function fetchReminders(): Promise<RemindersContext> {
  if (process.platform !== 'darwin') {
    return { lists: [], fetchedAt: new Date().toISOString() };
  }

  const scriptPath = join(tmpdir(), `personal-os-reminders-${Date.now()}.applescript`);

  try {
    await writeFile(scriptPath, buildScript());
    const { stdout } = await execAsync(`osascript "${scriptPath}"`, {
      timeout: 20_000,
    });
    await unlink(scriptPath).catch(() => undefined);

    const lines = stdout.trim().split('\n').filter(Boolean);
    const listMap = new Map<string, ReminderItem[]>();

    for (const line of lines) {
      const parts = line.split('|||');
      if (parts.length < 2) continue;
      const [listName, title, dueDate, priorityStr] = parts;
      if (!listName || !title) continue;

      if (!listMap.has(listName)) listMap.set(listName, []);
      listMap.get(listName)!.push({
        title: title.trim(),
        dueDate: dueDate?.trim() || undefined,
        priority: parseInt(priorityStr?.trim() || '0', 10),
      });
    }

    const lists = LISTS.map(({ id, name }) => ({
      id,
      name,
      items: listMap.get(name) ?? [],
    }));

    return { lists, fetchedAt: new Date().toISOString() };
  } catch (err) {
    await unlink(scriptPath).catch(() => undefined);
    throw new Error(`Reminders AppleScript failed: ${(err as Error).message}`);
  }
}
