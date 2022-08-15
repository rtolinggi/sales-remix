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
  Text,
  UnstyledButton,
} from "@mantine/core";
import { Form, useSubmit, useTransition } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  createEmployee,
  getEmail,
  updateEmployee,
} from "../../controllers/employee.server";
import { DatePicker } from "@mantine/dates";
import type { employees, users } from "@prisma/client";
import {
  IconCalendar,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconX,
} from "@tabler/icons";
import { requireUserId } from "~/utils/session.server";
import { validateAction } from "~/utils/validate.server";
import * as Z from "zod";
import { showNotification } from "@mantine/notifications";
import { getEmployee } from "../../controllers/employee.server";
import type { ColumnDef } from "@tanstack/react-table";
import type { EmployeeTable } from "../../utils/types.server";
import dayjs from "dayjs";
import IAvatar from "../../assets/avatar.jpg";
import { deleteUser } from "~/models/users.server";
import { openConfirmModal } from "@mantine/modals";
import TableEmployee from "~/components/DataTable";
import React, { useEffect, useState } from "react";
import { ExportToExcel } from "~/components/ExportData";

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
}).refine(
  (data) => data.action === "createEmploye" || data.action === "updateEmploye",
  {
    message: "Action Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  // Delete
  if (request.method === "DELETE") {
    const { email, action } = Object.fromEntries(await request.formData());
    if (
      (typeof email === "string" || typeof action === "string") &&
      (action === "deleteEmploye" || action === "updateEmploye")
    ) {
      if (action === "deleteEmploye") {
        await deleteUser(email as string);
        return json(
          {
            success: true,
            action: "delete employee",
          },
          { status: 200 }
        );
      }
    }
    return json({ success: false });
  }

  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  if (errors) {
    return json({ success: false, errors }, { status: 400 });
  }

  const newFormData = { ...formData };

  // Create
  if (request.method === "POST" && newFormData.action === "createEmploye") {
    delete newFormData.action;
    const result = await createEmployee(newFormData);
    if (!result) {
      return json({ success: false, errors }, { status: 400 });
    }
    return json(
      {
        success: true,
      },
      { status: 200 }
    );
  }

  //  Update
  if (request.method === "PUT" && newFormData.action === "updateEmploye") {
    delete newFormData.action;
    const result = await updateEmployee(newFormData);
    if (!result) {
      return json({ success: false, errors }, { status: 400 });
    }
    return json(
      {
        success: true,
      },
      { status: 200 }
    );
  }

  return json(
    { success: false, errors: "Something wrong Errors" },
    { status: 500 }
  );
};

export default function Employee() {
  const { users, employee } = useLoaderData<LoaderProps>();
  const transition = useTransition();
  const [actionUpdate, setActionUpdate] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<Array<string>>([]);
  const submit = useSubmit();
  const [opened, setOpened] = useState<boolean>(false);

  const visibility = {
    userId: false,
    gender: false,
    address: false,
    birthDay: false,
    endDate: false,
  };

  const data: Array<EmployeeTable> = employee.map((item) => {
    const dataTable = {
      userId: item.userId,
      email: item.users?.email,
      firstName: item.firstName,
      lastName: item.lastName,
      image: item.image,
      jobTitle: item.jobTitle,
      phone: item.phone,
      joinDate: item.joinDate,
      isActive: item.users?.isActive,
      gender: item.gender,
      address: item.address,
      birthDay: item.birthDay,
      endDate: item.endDate,
    };
    return dataTable;
  });

  const columns = React.useMemo<ColumnDef<EmployeeTable, any>[]>(
    () => [
      {
        id: "no",
        header: "No.",
        cell: (props) => parseInt(props.row.id) + 1,
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        // filterFn: "arrIncludesAll",
      },
      {
        id: "userId",
        accessorKey: "userId",
      },
      {
        id: "fullName",
        header: "Full Name",
        // filterFn: "arrIncludesAll",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: (item) => {
          return (
            <>
              <Group
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "start",
                }}>
                <Avatar src={IAvatar} size={35} radius='xl' />
                <Text>{item.getValue()}</Text>
              </Group>
            </>
          );
        },
      },
      {
        id: "isActive",
        accessorKey: "isActive",
        header: "Active",
        cell: (props) => {
          const active = props.getValue();
          return (
            <Group position='center' spacing='xs'>
              <ColorSwatch color={active ? "green" : "red"}>
                {active ? (
                  <CheckIcon width={10} color='white' />
                ) : (
                  <IconX width={14} color='white' />
                )}
              </ColorSwatch>
            </Group>
          );
        },
      },
      {
        accessorKey: "jobTitle",
        header: "Job Title",
        // filterFn: "arrIncludesAll",
      },
      {
        id: "joinDate",
        accessorKey: "joinDate",
        header: "Join Date",
        // filterFn: "arrIncludesAll",
        cell: (props) => {
          return <>{dayjs(props.getValue()).format("YYYY-MM-DD")}</>;
        },
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: "Phone",
        // filterFn: "arrIncludesAll",
      },
      {
        id: "action",
        header: "Actions",
        cell: (props) => {
          const idEmail = props.row
            .getAllCells()
            .map((item) => item.getValue());
          return (
            <Group spacing='xs'>
              <ThemeIcon
                color='red'
                variant='light'
                style={{ cursor: "pointer", marginRight: "10px" }}>
                <UnstyledButton
                  onClick={() =>
                    openConfirmModal({
                      title: "Delete Employee",
                      centered: true,
                      children: (
                        <Text size='sm'>
                          Are you sure you want to delete employee{" "}
                          {idEmail[1] as string}?
                        </Text>
                      ),
                      labels: {
                        confirm: "Delete Employee",
                        cancel: "No don't delete it",
                      },
                      onCancel: () => console.log("Cancel"),
                      onConfirm: () => {
                        submit(
                          {
                            action: "deleteEmploye",
                            email: idEmail[1] as string,
                          },
                          { method: "delete" }
                        );
                      },
                    })
                  }>
                  <IconTrash size={20} stroke={1.5} />
                </UnstyledButton>
              </ThemeIcon>
              <ThemeIcon
                color='lime'
                variant='light'
                style={{ cursor: "pointer" }}>
                <UnstyledButton
                  type='submit'
                  name='action'
                  value='updateEmploye'
                  onClick={() => {
                    setActionUpdate(true);
                    setUserEmail(idEmail as Array<string>);
                    setOpened(true);
                  }}>
                  <IconEdit size={20} stroke={1.5} />
                </UnstyledButton>
              </ThemeIcon>
            </Group>
          );
        },
      },
      {
        id: "gender",
        accessorKey: "gender",
      },
      {
        id: "address",
        accessorKey: "address",
      },
      {
        id: "birthDay",
        accessorKey: "birthDay",
      },
      {
        id: "endDate",
        accessorKey: "endDate",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSubmitPost = (event: React.SyntheticEvent) => {
    const currentTarget = (event.target as typeof event.target) && {};
    submit(currentTarget, { replace: true });
  };

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition?.submission?.formData.get("action") === "createEmploye"
    ) {
      showNotification({
        id: "loadingData",
        title: "Create Employee",
        message: "Create Employe Successfully",
        autoClose: true,
      });
    }
    if (
      transition.state === "loading" &&
      transition?.submission?.formData.get("action") === "updateEmploye"
    ) {
      showNotification({
        id: "loadingData",
        title: "Update Employee",
        message: "Update Employe Successfully",
        autoClose: true,
      });
      setActionUpdate(false);
    }
    if (
      transition.state === "submitting" &&
      transition?.submission?.formData.get("action") === "deleteEmploye"
    ) {
      showNotification({
        id: "loadingData",
        title: "Delete Employee",
        message: "Delete Employe Successfully",
        autoClose: true,
      });
    }
    setOpened(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => {
          setActionUpdate(false);
          setOpened(false);
        }}
        title='Employee'
        padding='xl'
        size='xl'
        position='right'>
        {/* Drawer content */}
        <Form
          method={actionUpdate ? "put" : "post"}
          onSubmit={handleSubmitPost}>
          <Stack spacing='sm' align='stretch'>
            <Select
              variant='filled'
              defaultValue={actionUpdate ? userEmail[2] : null}
              name='userId'
              data={
                actionUpdate
                  ? [{ value: userEmail[2], label: userEmail[1] }]
                  : users.map((data) => {
                      const result = {
                        value: data.userId,
                        label: data.email,
                      };
                      return result;
                    })
              }
              searchable
              clearable
              placeholder='Select Email'
              label='Email'
              required
            />
            <Group grow>
              <TextInput
                defaultValue={
                  actionUpdate ? userEmail[3].split(" ")[0] : undefined
                }
                variant='filled'
                name='firstName'
                placeholder='Your First Name'
                label='Full Name'
                required
              />
              <TextInput
                defaultValue={
                  actionUpdate ? userEmail[3].split(" ")[1] : undefined
                }
                variant='filled'
                name='lastName'
                placeholder='Your Last Name'
                label='Last Name'
                required
              />
            </Group>
            <Group position='apart' grow>
              <Radio.Group
                label='Gender'
                spacing='xl'
                required
                defaultValue={actionUpdate ? userEmail[9] : undefined}>
                <Radio value='F' name='gender' label='Female' />
                <Radio value='M' name='gender' label='Male' />
              </Radio.Group>
              <Radio.Group
                label='Status JOB'
                spacing='xl'
                required
                defaultValue={
                  actionUpdate ? JSON.stringify(userEmail[4]) : undefined
                }>
                <Radio value='true' name='isActive' label='Active' />
                <Radio value='false' name='isActive' label='Not Active' />
              </Radio.Group>
            </Group>
            <Group position='apart' grow>
              <DatePicker
                variant='filled'
                name='birthDay'
                defaultValue={
                  actionUpdate ? new Date(userEmail[11]) : undefined
                }
                locale='id'
                placeholder='Pick date'
                icon={<IconCalendar size={16} />}
                label='Birth Day'
                allowFreeInput
                inputFormat='YYYY-MM-DD'
              />
              <NumberInput
                variant='filled'
                name='phone'
                defaultValue={actionUpdate ? parseInt(userEmail[7]) : undefined}
                hideControls
                label='No Handphone'
                required
              />
            </Group>
            <Group position='apart' grow>
              <DatePicker
                variant='filled'
                name='joinDate'
                locale='id'
                defaultValue={actionUpdate ? new Date(userEmail[6]) : undefined}
                placeholder='Pick date'
                icon={<IconCalendar size={16} />}
                label='Join Date'
                allowFreeInput
                inputFormat='YYYY-MM-DD'
              />
              <DatePicker
                variant='filled'
                name='endDate'
                locale='id'
                defaultValue={
                  actionUpdate ? new Date(userEmail[12]) : undefined
                }
                placeholder='Pick date'
                icon={<IconCalendar size={16} />}
                label='End Date'
                inputFormat='YYYY-MM-DD'
                allowFreeInput
              />
            </Group>
            <Select
              variant='filled'
              name='jobTitle'
              defaultValue={actionUpdate ? userEmail[5] : undefined}
              data={["Sales", "SPG", "Supervisior"]}
              searchable
              clearable
              placeholder='Select Title'
              label='Job Title'
              required
            />
            <Textarea
              variant='filled'
              name='address'
              placeholder='Address'
              label='Address'
              defaultValue={actionUpdate ? userEmail[10] : undefined}
              required
            />
          </Stack>
          <Button
            type='submit'
            mt={20}
            name='action'
            value={actionUpdate ? "updateEmploye" : "createEmploye"}>
            {actionUpdate ? "Update" : "Insert"}
          </Button>
        </Form>
      </Drawer>
      <Paper
        radius='md'
        p='xl'
        withBorder
        style={{
          borderWidth: "0px 0px 0px 5px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}>
        <Title order={3}>Employee</Title>
      </Paper>
      <Group spacing='xs'>
        <Button
          onClick={() => {
            setActionUpdate(false);
            setOpened(true);
          }}
          leftIcon={<IconUserPlus size={20} />}>
          Create Employee
        </Button>
        <ExportToExcel apiData={data} fileName='employee' />
      </Group>
      <Paper
        shadow='sm'
        radius='md'
        style={{
          width: "100%",
          padding: "20px 10px",
          overflow: "auto",
          marginTop: "1rem",
        }}>
        <TableEmployee data={data} columns={columns} visibility={visibility} />
      </Paper>
    </>
  );
}
