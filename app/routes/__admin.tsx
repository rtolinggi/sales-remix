import { Container } from "@mantine/core";
import { Outlet } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getUser } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await getUser(request);
  return auth ? null : redirect("login");
};

const Dashboard = () => {
  return (
    <>
      <Container>
        <p>TESTING</p>
        <Outlet />
      </Container>
    </>
  );
};

export default Dashboard;
