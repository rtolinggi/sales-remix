import { Button, Paper, Title } from "@mantine/core";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  return json({ user: user }, { status: 200 });
};

const DashboardPage = () => {
  const data = useLoaderData();
  console.log(data);
  return (
    <>
      <Paper
        radius='md'
        p='sm'
        withBorder
        style={{
          borderLeftWidth: "5px",
          borderBottomWidth: "0px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}>
        <Title order={3}>Dashborad</Title>
      </Paper>
      <Button>Add Dashboard</Button>
    </>
  );
};

export default DashboardPage;
