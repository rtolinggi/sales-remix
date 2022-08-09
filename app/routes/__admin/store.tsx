import {
  Button,
  Drawer,
  NumberInput,
  Paper,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { IconPlus } from "@tabler/icons";
import { useState } from "react";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  return json({ user }, { status: 200 });
};
export default function Store() {
  const [opened, setOpened] = useState<boolean>(false);
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title="Create Store"
        padding="xl"
        size="xl"
        position="right"
      >
        {/* Drawer content */}
        <Form method="post">
          <Stack spacing="sm" align="stretch">
            <TextInput
              variant="filled"
              name="storeName"
              label="Store Name"
              required
            />
            <TextInput
              variant="filled"
              name="ownerName"
              label="Owner Name"
              required
            />
            <NumberInput
              variant="filled"
              name="phone"
              hideControls
              label="No Handphone"
              required
            />
            <Select
              variant="filled"
              data={["Cluster A", "Cluister B", "Cluster C"]}
              name="clusterId"
              searchable
              clearable
              placeholder="Select Cluster"
              label="Cluster Name"
              required
            />
            <Select
              variant="filled"
              data={["Sub Cluster A", "Sub Cluister B", "Sub Cluster C"]}
              name="subClusterId"
              searchable
              clearable
              placeholder="Select Sub Cluster"
              label="Sub Cluster Name"
              required
            />

            <Textarea
              variant="filled"
              name="address"
              placeholder="Address"
              label="Address"
              required
            />
          </Stack>
          <Button
            leftIcon={<IconPlus size={20} color="white" />}
            type="submit"
            mt={20}
            name="action"
          >
            Save
          </Button>
        </Form>
      </Drawer>

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
        <Title order={3}>Store</Title>
      </Paper>
      <Button
        leftIcon={<IconPlus size={20} color="white" />}
        onClick={() => setOpened(true)}
      >
        Add Store
      </Button>
    </>
  );
}
