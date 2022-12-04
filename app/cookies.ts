import { createCookie } from "@remix-run/node";

export const langCookie=createCookie("lang",{
    maxAge:604_800_00,
    sameSite:'lax'
})