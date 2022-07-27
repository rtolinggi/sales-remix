import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { logout } from "~/controllers/auth.server";
import { getUsersession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (typeof action !== "string") {
    return json({ success: false }, { status: 400 });
  }

  console.log("LOGOUT");

  if (action === "logout") {
    console.log(getUsersession(request));
    return logout(request);
  }

  return null;
};

const DashboardPage = () => {
  return <DashboardPage />;
};

export default DashboardPage;
