import { getUser, requireUserId } from "~/utils/session.server";
import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  console.log(user?.employees?.jobTitle === "Sales");
  console.log(user?.employees?.jobTitle === "SPG");
  if (
    user?.employees?.jobTitle === "Sales" ||
    user?.employees?.jobTitle === "SPG"
  ) {
    return redirect("sales");
  }
  return redirect("/dashboard");
};
