import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import type { Work } from "~/models/work.server";
import { getWorkListItems } from "~/models/work.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

type LoaderData = {
  workListItems: Work[];
};

export async function loader ({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const workListItems = await getWorkListItems({ userId });
  return json({ workListItems });
};

export default function WorksPage() {
  const data = useLoaderData<typeof loader>() as LoaderData;

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header />
      <main className="flex h-full bg-white">
        <div className="h-full border-r w-80 bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + Work
          </Link>

          <hr />

          {data.workListItems.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.workListItems.map((work) => (
                <li key={work.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={work.id}
                  >
                    📝 {work.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Header() {
  const user = useUser();
  return (
    <header className="flex items-center justify-between p-4 text-white bg-slate-800">
      <h1 className="text-3xl font-bold">
        <Link to=".">Notes</Link>
      </h1>
      <p>{user.email}</p>
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="px-4 py-2 text-blue-100 rounded bg-slate-600 hover:bg-blue-500 active:bg-blue-600"
        >
          Logout
        </button>
      </Form>
    </header>
  );
}
