import type { PortfolioWork } from "~/portfolio/types";
import type { User } from "./user.server";
import { supabase } from "./user.server";

export type MediaType = "image" | "video";

export type Work = PortfolioWork & {
  mediaType: MediaType;
  videoUri?: string;
  description: string;
  userId: string;
};

export type CreateWorkInput = Omit<Work, "id"> & { userId: User["id"] };

function normalizeImageUri(value: string) {
  if (/^(?:https?:)?\/\//.test(value) || value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

function toPortfolioWork(value: unknown): PortfolioWork | null {
  if (!value || typeof value !== "object") return null;

  const work = value as Record<string, unknown>;
  const hasValidId = typeof work.id === "string" || typeof work.id === "number";

  if (
    !hasValidId ||
    typeof work.name !== "string" ||
    typeof work.title !== "string" ||
    typeof work.date !== "string" ||
    typeof work.imageUri !== "string" ||
    work.imageUri.length === 0 ||
    typeof work.groupName !== "string" ||
    typeof work.groupTitle !== "string"
  ) {
    return null;
  }

  return {
    id: String(work.id),
    name: work.name,
    title: work.title,
    date: work.date,
    imageUri: normalizeImageUri(work.imageUri),
    groupName: work.groupName,
    groupTitle: work.groupTitle,
  };
}

export async function getInfroListItems(): Promise<PortfolioWork[]> {
  const { data, error } = await supabase
    .from("works")
    .select("id, name, title, imageUri, date, groupName, groupTitle");

  let source: unknown = data;

  if (error) {
    try {
      const response = await fetch(`${process.env.URL}/data.json`);
      source = response.ok ? await response.json() : [];
    } catch {
      source = [];
    }
  }

  if (!Array.isArray(source)) return [];

  return source.flatMap((value) => {
    const work = toPortfolioWork(value);
    return work ? [work] : [];
  });
}

export async function getWorkListItems({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("works")
    .select(
      "id,name,title,date,imageUri,description,videoUri,groupName,groupTitle"
    )
    .eq("userId", userId);

  return data;
}

export async function createWork({
  name,
  title,
  imageUri,
  videoUri = "",
  description,
  groupName,
  groupTitle,
  date,
  userId,
}: CreateWorkInput) {
  const { data, error } = await supabase
    .from("works")
    .insert([
      {
        name,
        title,
        imageUri,
        videoUri,
        description,
        groupName,
        groupTitle,
        date,
        userId,
      },
    ])
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteWork({
  id,
  userId,
}: Pick<Work, "id"> & { userId: User["id"] }) {
  const { error } = await supabase
    .from("works")
    .delete()
    .match({ id, profile_id: userId });

  if (!error) {
    return {};
  }

  return null;
}

export async function getWork({
  id,
  userId,
}: Pick<Work, "id"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .eq("profile_id", userId)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      userId: data.userId,
      id: data.id,
      title: data.title,
      name: data.name,
      description: data.description,
      imageUri: data.imageUri,
      videoUri: data.videoUri,
      date: data.date,
    };
  }

  return null;
}
