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
import { Form, useActionData, useTransition } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createEmployee, getEmail } from "../../controllers/employee.server";
import { DatePicker } from "@mantine/dates";
import type { users } from "@prisma/client";
import { IconCalendar } from "@tabler/icons";
import { requireUserId } from "~/utils/session.server";
import { validateAction } from "~/utils/validate.server";
import * as Z from "zod";
import { showNotification } from "@mantine/notifications";

type UsersProps = {
  data: Array<users>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const dataEmail = await getEmail();
  return json(
    {
      success: true,
      data: dataEmail,
      user: user,
    },
    { status: 200 }
  );
};

const schema = Z.object({
  userId: Z.string({
    required_error: "UserId is required",
  }),
  firstName: Z.string({
    required_error: "First Name is required",
  }),
  lastName: Z.string({
    required_error: "Last Name is required",
  }),
  gender: Z.enum(["F", "M"]),
  address: Z.string(),
  phone: Z.string(),
  birthDay: Z.string(),
  joinDate: Z.string(),
  endDate: Z.string(),
  image: Z.string().default("default.jpg"),
  jobTitle: Z.string(),
  action: Z.string().optional(),
}).refine((data) => data.action === "createEmploye", {
  message: "Action Not Allowed",
  path: ["action"],
});

export type ActionInput = Z.infer<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  if (errors) {
    return json({ success: false, errors }, { status: 400 });
  }

  const newFormData = { ...formData };
  delete newFormData.action;

  const result = await createEmployee(newFormData);
  if (!result) {
    return json({ success: false, errors }, { status: 400 });
  }

  return json({ success: true }, { status: 200 });
};

export default function Employee() {
  const { data } = useLoaderData<UsersProps>();
  const transition = useTransition();
  const [opened, setOpened] = useState<boolean>(false);
  const actionData = useActionData<ActionInput>();
  useEffect(() => {
    if (transition.state === "idle") {
      showNotification({
        title: "Created Employe",
        message: "Employe Successfully created",
      });
      setOpened(false);
    }
  }, [transition]);
  console.log(actionData);
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
          <Stack spacing="sm" align="stretch">
            <Select
              variant="filled"
              name="userId"
              data={data.map((data) => {
                const result = {
                  value: data.userId,
                  label: data.email,
                };
                return result;
              })}
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
                <Radio value="active" name="status" label="Active" />
                <Radio value="not active" name="status" label="Not Active" />
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
          <Button type="submit" mt={20} name="action" value="createEmploye">
            Add Data Employe
          </Button>
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
