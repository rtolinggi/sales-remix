import {
  Button,
  CheckIcon,
  Drawer,
  Group,
  NumberInput,
  Paper,
  Radio,
  Select,
  Stack,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  ColorSwatch,
  Avatar,
} from "@mantine/core";
import { Form, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createEmployee, getEmail } from "../../controllers/employee.server";
import { DatePicker } from "@mantine/dates";
import type { employees, users } from "@prisma/client";
import { IconCalendar, IconEdit, IconTrash, IconX } from "@tabler/icons";
import { requireUserId } from "~/utils/session.server";
import { validateAction } from "~/utils/validate.server";
import * as Z from "zod";
import { showNotification } from "@mantine/notifications";
import { getEmployee } from "../../controllers/employee.server";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "../../components/DataTable";
import type { EmployeeTable } from "../../utils/types.server";
import dayjs from "dayjs";

type LoaderProps = {
  users: Array<users>;
  employee: Array<employees & { users: users | undefined }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  if (!user)
    return json({ success: false, errors: "Unauthorize" }, { status: 400 });

  const dataEmail = await getEmail();
  const dataEmployee = await getEmployee();

  if (dataEmail && dataEmployee) {
    return json(
      {
        success: true,
        users: dataEmail,
        employee: dataEmployee,
      },
      { status: 200 }
    );
  }
  return null;
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
  isActive: Z.string(),
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
  const { users, employee } = useLoaderData<LoaderProps>();
  const transition = useTransition();
  const [opened, setOpened] = useState<boolean>(false);

  const data: Array<EmployeeTable> = employee.map((item) => {
    const dataTable = {
      email: item.users?.email,
      firstName: item.firstName,
      lastName: item.lastName,
      image: item.image,
      jobTitle: item.jobTitle,
      phone: item.phone,
      joinDate: item.joinDate,
      isActive: item.users?.isActive,
    };
    return dataTable;
  });

  const columnHelper = createColumnHelper<EmployeeTable>();
  const columns = [
    columnHelper.display({
      id: "no",
      header: "No.",
      cell: (props) => parseInt(props.row.id) + 1,
    }),
    columnHelper.accessor("email", {
      header: "Email",
    }),
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: "firstName",
      header: "Full Name",
    }),
    columnHelper.accessor("image", {
      header: "Image",
      cell: (props) => {
        return (
          <>
            <Avatar src="https://i.pravatar.cc/150" alt="it's me" radius="xl" />
          </>
        );
      },
    }),
    columnHelper.accessor("isActive", {
      header: "Active",
      cell: (props) => {
        const active = props.getValue();
        return (
          <Group position="center" spacing="xs">
            <ColorSwatch color={active ? "green" : "red"}>
              {active ? (
                <CheckIcon width={10} color="white" />
              ) : (
                <IconX width={14} color="white" />
              )}
            </ColorSwatch>
          </Group>
        );
      },
    }),
    columnHelper.accessor("jobTitle", {
      header: "Job Title",
    }),
    columnHelper.accessor("joinDate", {
      header: "Join Date",
      cell: (props) => {
        return <>{dayjs(props.getValue()).format("YYYY-MM-DD")}</>;
      },
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
    }),
    columnHelper.display({
      id: "action",
      header: "Actions",
      cell: (props) => (
        <>
          <ThemeIcon
            color="red"
            variant="light"
            style={{ cursor: "pointer", marginRight: "10px" }}
            onClick={() => data[parseInt(props.row.id)].email}
          >
            <IconTrash size={20} stroke={1.5} />
          </ThemeIcon>
          <ThemeIcon color="lime" variant="light" style={{ cursor: "pointer" }}>
            <IconEdit size={20} stroke={1.5} />
          </ThemeIcon>
        </>
      ),
    }),
  ];

  useEffect(() => {
    if (transition.state === "submitting") {
      showNotification({
        title: "Created Employe",
        message: "Employe Successfully created",
      });
      setOpened(false);
    }
  }, [transition]);
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
              data={users.map((data) => {
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
      <Paper
        shadow="sm"
        radius="md"
        style={{
          width: "100%",
          padding: "20px 10px",
          overflow: "auto",
          marginTop: "1rem",
        }}
      >
        <DataTable data={data} columns={columns} />
      </Paper>
    </>
  );
}
