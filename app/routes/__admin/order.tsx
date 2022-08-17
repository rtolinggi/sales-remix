import { Button, LoadingOverlay, Paper, Title } from "@mantine/core";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useTransition } from "@remix-run/react";
import { IconCirclePlus } from "@tabler/icons";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  return json({ user: user }, { status: 200 });
};

export default function Order() {
  const transition = useTransition();
  return (
    <>
      <LoadingOverlay visible={transition.state === "loading"} />
      <Paper
        radius="md"
        p="xl"
        withBorder
        style={{
          borderWidth: "0px 0px 0px 5px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}
      >
        <Title order={3}>Order</Title>
      </Paper>
      <Button leftIcon={<IconCirclePlus size={20} />}>Add Order</Button>
    </>
  );
}
