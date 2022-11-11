import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { Work } from "~/models/work.server";
import { deleteWork, getWork } from "~/models/work.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";

type LoaderData = {
  work: Work;
};

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.workId, "workId not found");

  const work = await getWork({ userId, id: params.workId });
  if (!work) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ work });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.workId, "workId not found");

  await deleteWork({ userId, id: params.workId });

  return redirect("/works");
};

export default function WorkDetailsPage() {
  const data = useLoaderData<typeof loader>() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.work.title}</h3>
      <p className="py-6">{data.work.desc}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}
