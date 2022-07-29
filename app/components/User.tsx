import { getUser } from "../utils/session.server";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await getUser(request);
  return json({ data: auth });
};
const CUser: React.FC = () => {
  const { data } = useLoaderData();
  return (
    <>
      <h1>{data}</h1>
    </>
  );
};

export default CUser;
