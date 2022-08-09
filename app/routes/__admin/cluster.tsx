import { Button, Paper, Title } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  return json({ user }, { status: 200 });
};
export default function Cluster() {
  return (
    <>
      <Paper
        radius="md"
        p="sm"
        withBorder
        style={{
          borderLeftWidth: "5px",
          borderBottomWidth: "0px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}
      >
        <Title order={3}>Cluster</Title>
      </Paper>
      <Button>Add Cluster</Button>
    </>
  );
}
