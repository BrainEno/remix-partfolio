import { createCookie } from "@remix-run/node";

export const lngCookie=createCookie("lng",{
    maxAge:604_800_00,
    sameSite:'lax'
})