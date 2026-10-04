import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("archive", "routes/archive.tsx"),
  route("archive/:facet/:value", "routes/archive-facet.tsx"),
  route("archive/:itemId", "routes/archive-item.tsx"),
  route("lists", "routes/lists.tsx"),
  route("lists/:listId", "routes/list-detail.tsx"),
] satisfies RouteConfig;
