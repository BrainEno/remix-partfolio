import { archiveContent } from "./content";
import type { ArchiveItem, ArchiveList } from "./types";

const itemById = new Map<string, ArchiveItem>();

for (const item of archiveContent.items) {
  if (itemById.has(item.id)) {
    throw new Error(`Duplicate archive item id: ${item.id}`);
  }
  itemById.set(item.id, item);
}

const listById = new Map<string, ArchiveList>();

for (const list of archiveContent.lists) {
  if (listById.has(list.id)) {
    throw new Error(`Duplicate archive list id: ${list.id}`);
  }
  listById.set(list.id, list);

  for (const entry of list.entries) {
    if (!itemById.has(entry.itemId)) {
      throw new Error(
        `Archive list ${list.id} references unknown item: ${entry.itemId}`
      );
    }
  }
}

export function getArchiveItem(id: string) {
  return itemById.get(id);
}

export function getArchiveList(id: string) {
  return listById.get(id);
}

export function resolveArchiveList(list: ArchiveList) {
  return list.entries.map((entry, index) => ({
    rank: index + 1,
    entry,
    item: itemById.get(entry.itemId)!,
  }));
}
