import { redirect } from "react-router";

export { redirect };

export type LoaderArgs = {
  request: Request;
  params: Record<string, string | undefined>;
  context: unknown;
};

export type ActionArgs = LoaderArgs;

export type LoaderFunction = (
  args: LoaderArgs
) => unknown | Promise<unknown>;

export type LinksFunction = () => Array<Record<string, unknown>>;

export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}
