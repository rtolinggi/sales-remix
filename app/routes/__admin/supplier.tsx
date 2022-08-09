import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Paper,
  Radio,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { IconCalendar } from "@tabler/icons";
import { useState } from "react";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  return json({ user }, { status: 200 });
};
export default function Supplier() {
  const [opened, setOpened] = useState<boolean>(false);
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title="Supplier"
        padding="xl"
        size="xl"
        position="right"
      >
        {/* Drawer content */}
        <Form method="post">
          <Stack spacing="sm" align="stretch">
            <Select
              variant="filled"
              data={["Toko A", "Toko B", "TokoC"]}
              name="userId"
              searchable
              clearable
              placeholder="Select Email"
              label="Email"
              required
            />
            <Group grow>
              <TextInput
                variant="filled"
                name="firstName"
                placeholder="Your First Name"
                label="Full Name"
                required
              />
              <TextInput
                variant="filled"
                name="lastName"
                placeholder="Your Last Name"
                label="Last Name"
                required
              />
            </Group>
            <Group position="apart" grow>
              <Radio.Group label="Gender" spacing="xl" required>
                <Radio value="F" name="gender" label="Female" />
                <Radio value="M" name="gender" label="Male" />
              </Radio.Group>
              <Radio.Group label="Status JOB" spacing="xl" required>
                <Radio value="true" name="isActive" label="Active" />
                <Radio value="false" name="isActive" label="Not Active" />
              </Radio.Group>
            </Group>
            <Group position="apart" grow>
              <DatePicker
                variant="filled"
                name="birthDay"
                locale="id"
                placeholder="Pick date"
                icon={<IconCalendar size={16} />}
                label="Birth Day"
                allowFreeInput
                inputFormat="YYYY-MM-DD"
              />
              <NumberInput
                variant="filled"
                name="phone"
                hideControls
                label="No Handphone"
                required
              />
            </Group>
            <Group position="apart" grow>
              <DatePicker
                variant="filled"
                name="joinDate"
                locale="id"
                placeholder="Pick date"
                icon={<IconCalendar size={16} />}
                label="Join Date"
                allowFreeInput
                inputFormat="YYYY-MM-DD"
              />
              <DatePicker
                variant="filled"
                name="endDate"
                locale="id"
                placeholder="Pick date"
                icon={<IconCalendar size={16} />}
                label="End Date"
                inputFormat="YYYY-MM-DD"
                allowFreeInput
              />
            </Group>
            <Select
              variant="filled"
              name="jobTitle"
              data={["Sales", "SPG", "Supervisior"]}
              searchable
              clearable
              placeholder="Select Title"
              label="Job Title"
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
          <Button type="submit" mt={20} name="action"></Button>
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
        <Title order={3}>Supplier</Title>
      </Paper>
      <Button onClick={() => setOpened(true)}>Add Supplier</Button>
    </>
  );
}
