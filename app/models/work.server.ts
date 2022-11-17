import type { User } from "./user.server";
import { supabase } from "./user.server";

export type MediaType = "image" | "video";

export type Work = {
  id: string;
  name: string; //en
  title: string; //zh
  date: string; //year
  groupName: string; //en
  groupTitle: string; //zh
  mediaType: MediaType;
  imageUri: string;
  videoUri?: string;
  description: string;
  userId: string;
};

export type CreateWorkInput = Omit<Work, "id"> & { userId: User["id"] };

export async function getInfroListItems() {
  const { data, error } = await supabase
    .from("works")
    .select("id, name, title, date, groupName, groupTitle");
  if (error) console.log("error",error);
  return data;
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
