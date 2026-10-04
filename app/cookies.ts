import { createCookie } from "react-router";

export const langCookie = createCookie("lang", {
  maxAge: 60 * 60 * 24 * 7,
  sameSite: "lax",
});
