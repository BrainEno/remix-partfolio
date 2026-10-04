import { archiveContent } from "./content";
import { archiveCreators } from "./creators";
import type {
  ArchiveCreator,
  ArchiveItem,
  ArchiveKind,
  ArchiveList,
} from "./types";

const creatorById = new Map<string, ArchiveCreator>();

for (const creator of archiveCreators) {
  if (creatorById.has(creator.id)) {
    throw new Error(`Duplicate archive creator id: ${creator.id}`);
  }
  creatorById.set(creator.id, creator);
}

const itemById = new Map<string, ArchiveItem>();

for (const item of archiveContent.items) {
  if (itemById.has(item.id)) {
    throw new Error(`Duplicate archive item id: ${item.id}`);
  }

  for (const creatorId of item.creatorIds) {
    if (!creatorById.has(creatorId)) {
      throw new Error(
        `Archive item ${item.id} references unknown creator: ${creatorId}`
      );
    }
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

export function getArchiveCreator(id: string) {
  return creatorById.get(id);
}

export function getArchiveList(id: string) {
  return listById.get(id);
}

export function resolveArchiveCreators(item: ArchiveItem) {
  return item.creatorIds.map((creatorId) => creatorById.get(creatorId)!);
}

export function resolveArchiveList(list: ArchiveList) {
  return list.entries.map((entry, index) => ({
    rank: index + 1,
    entry,
    item: itemById.get(entry.itemId)!,
  }));
}

export function getArchiveItemsByKind(kind: ArchiveKind) {
  return archiveContent.items.filter((item) => item.kind === kind);
}

export function getArchiveItemsByTag(tag: string) {
  const normalizedTag = tag.toLowerCase();
  return archiveContent.items.filter((item) =>
    item.tags.some((value) => value.toLowerCase() === normalizedTag)
  );
}

export function getArchiveItemsByYear(year: string) {
  return archiveContent.items.filter((item) => item.year === year);
}

export function getArchiveItemsByCreator(creatorId: string) {
  return archiveContent.items.filter((item) =>
    item.creatorIds.includes(creatorId)
  );
}

export function getArchiveKinds() {
  const kinds: readonly ArchiveKind[] = ["book", "audio", "video"];
  return kinds.map((kind) => ({
    value: kind,
    count: getArchiveItemsByKind(kind).length,
  }));
}

export function getArchiveTags() {
  const counts = new Map<string, number>();

  archiveContent.items.forEach((item) => {
    item.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export function getArchiveYears() {
  const counts = new Map<string, number>();

  archiveContent.items.forEach((item) => {
    if (!item.year) return;
    counts.set(item.year, (counts.get(item.year) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.value.localeCompare(a.value));
}

export function getArchiveCreators() {
  return archiveCreators
    .map((creator) => ({
      creator,
      count: getArchiveItemsByCreator(creator.id).length,
    }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => a.creator.name.en.localeCompare(b.creator.name.en));
}
