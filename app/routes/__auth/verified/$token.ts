import type { LoaderFunction } from "@remix-run/node";
import { verifiedEmail } from "~/controllers/auth.server";

export const loader: LoaderFunction = async ({ params }) => {
  let token = params.token;
  token = token as string;
  return verifiedEmail(token);
};
