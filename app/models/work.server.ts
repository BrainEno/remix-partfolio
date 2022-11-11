import type { User } from "./user.server";
import { supabase } from "./user.server";

export type Work = {
  id: string;
  title: string;
  image?: string;
  video?: string;
  desc: string;
  profile_id: string;
};

export async function getWorkListItems({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("works")
    .select("id, title image desc")
    .eq("profile_id", userId);

  return data;
}

export async function createWork({
  title,
  image='',
  video='',
  desc,
  userId,
}: Pick<Work, "image" | "title" | "video" | "desc"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("works")
    .insert([{ title, image, video, desc, profile_id: userId }])
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
    .delete({ returning: "minimal" })
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
      userId: data.profile_id,
      id: data.id,
      title: data.title,
      desc: data.desc,
      image: data.image,
      video: data.video,
    };
  }

  return null;
}
