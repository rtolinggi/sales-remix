import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { logout } from "~/controllers/auth.server";

export const loader: LoaderFunction = async () => {
  return redirect("/");
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (typeof action !== "string") {
    return json({ success: false }, { status: 400 });
  }

  if (action === "logout") {
    return logout(request);
  }

  return null;
};
