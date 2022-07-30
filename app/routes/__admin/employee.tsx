import {
  Button,
  Drawer,
  Group,
  Paper,
  Radio,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { Form } from "@remix-run/react";
import { useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getEmail } from "../../controllers/employee.server";

export const loader: LoaderFunction = async () => {
  const dataEmail = await getEmail();
  return json(
    {
      success: true,
      data: dataEmail,
    },
    { status: 200 }
  );
};

export default function Employee() {
  const [opened, setOpened] = useState<boolean>(false);
  const data = useLoaderData();
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Employee"
        padding="xl"
        size="xl"
        position="right"
      >
        {/* Drawer content */}
        <Form method="post">
          <Stack spacing="lg" align="stretch">
            <Select
              data={data.data.map((item: any) => item.email)}
              searchable
              clearable
              label="Email"
              required
            />
            <Group grow>
              <TextInput
                variant="filled"
                placeholder="Your First Name"
                label="Full Name"
                required
              />
              <TextInput
                variant="filled"
                placeholder="Your Last Name"
                label="Last Name"
                required
              />
            </Group>
            <Group position="apart" grow>
              <Radio.Group label="Gender" spacing="xl" required>
                <Radio value="F" label="Female" />
                <Radio value="M" label="Male" />
              </Radio.Group>
              <Radio.Group label="Active" spacing="xl" required>
                <Radio value="active" label="Active" />
                <Radio value="not active" label="Not Active" />
              </Radio.Group>
            </Group>
          </Stack>
        </Form>
      </Drawer>
      <Paper
        radius="md"
        p="sm"
        withBorder
        style={{
          borderWidth: "0px 0px 0px 5px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}
      >
        <Title order={3}>Employee</Title>
      </Paper>
      <Button onClick={() => setOpened(true)}>Add Employee</Button>
    </>
  );
}
