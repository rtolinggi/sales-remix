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
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getEmail } from "../../controllers/employee.server";
import { DatePicker } from "@mantine/dates";
import type { users } from "@prisma/client";
import { IconCalendar } from "@tabler/icons";
import { requireUserId } from "~/utils/session.server";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";

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
  firstName: Z.string({
    required_error: "First Name is required",
  }),
  lastName: Z.string({
    required_error: "Last Name is required",
  }),
  gender: Z.enum(["F", "M"]),
  birthDay: Z.string({
    invalid_type_error: "Invalid Date",
  }),
  address: Z.string(),
  phone: Z.string(),
  joinDate: Z.string({
    invalid_type_error: "Invalid Date",
  }),
  endDate: Z.string({
    invalid_type_error: "Invalid date",
  }),
  jobTitle: Z.string(),
  image: Z.string().default("default.jpg"),
});

export const action: ActionFunction = async ({ request }) => {
  const { formData, error } = await validateAction({
    request,
    schema,
  });
  console.log(formData);
  if (error) {
    return json({ error }, { status: 400 });
  }

  const {
    firstName,
    lastName,
    gender,
    address,
    phone,
    joinDate,
    endDate,
    jobTitle,
    image,
  } = FormData;
};

export default function Employee() {
  const [opened, setOpened] = useState<boolean>(false);
  const { data } = useLoaderData<UsersProps>();
  const handleSubmit = () => {
    console.log("SUBMIT");
  };
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
              name="email"
              data={data.map((item) => item.email)}
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
                value={new Date()}
                dateParser={(v) => new Date(Date.parse(v))}
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
          <Button type="submit" mt={20}>
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
