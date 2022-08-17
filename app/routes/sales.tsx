import { Title } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  return await requireUserId(request);
};

export default function Sales() {
  return (
    <>
      <Title order={3}>Sales Page</Title>
      <Outlet />
    </>
  );
}
