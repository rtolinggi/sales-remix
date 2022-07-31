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
import { Form } from "@remix-run/react";
import { useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getEmail } from "../../controllers/employee.server";
import { DatePicker } from "@mantine/dates";
import type { users } from "@prisma/client";
import { IconCalendar } from "@tabler/icons";
import { requireUserId } from "~/utils/session.server";

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

export default function Employee() {
  const [opened, setOpened] = useState<boolean>(false);
  const { data } = useLoaderData<UsersProps>();
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title='Employee'
        padding='xl'
        size='xl'
        position='right'>
        {/* Drawer content */}
        <Form method='post'>
          <Stack spacing='sm' align='stretch'>
            <Select
              variant='filled'
              data={data.map((item) => item.email)}
              searchable
              clearable
              placeholder='Select Email'
              label='Email'
              required
            />
            <Group grow>
              <TextInput
                variant='filled'
                placeholder='Your First Name'
                label='Full Name'
                required
              />
              <TextInput
                variant='filled'
                placeholder='Your Last Name'
                label='Last Name'
                required
              />
            </Group>
            <Group position='apart' grow>
              <Radio.Group label='Gender' spacing='xl' required>
                <Radio value='F' label='Female' />
                <Radio value='M' label='Male' />
              </Radio.Group>
              <Radio.Group label='Status JOB' spacing='xl' required>
                <Radio value='active' label='Active' />
                <Radio value='not active' label='Not Active' />
              </Radio.Group>
            </Group>
            <Group position='apart' grow>
              <DatePicker
                variant='filled'
                locale='id'
                placeholder='Pick date'
                icon={<IconCalendar size={16} />}
                label='Birth Day'
                allowFreeInput
                inputFormat='YYYY-MM-DD'
              />
              <NumberInput
                variant='filled'
                hideControls
                label='No Handphone'
                required
              />
            </Group>
            <Group position='apart' grow>
              <DatePicker
                variant='filled'
                locale='id'
                placeholder='Pick date'
                icon={<IconCalendar size={16} />}
                label='Join Date'
                allowFreeInput
                inputFormat='YYYY-MM-DD'
              />
              <DatePicker
                variant='filled'
                locale='id'
                placeholder='Pick date'
                icon={<IconCalendar size={16} />}
                label='End Date'
                inputFormat='YYYY-MM-DD'
                allowFreeInput
              />
            </Group>
            <Select
              variant='filled'
              data={["Sales", "SPG", "Supervisior"]}
              searchable
              clearable
              placeholder='Select Title'
              label='Job Title'
              required
            />
            <Textarea
              variant='filled'
              placeholder='Address'
              label='Address'
              required
            />
          </Stack>
          <Button mt={20}>Add Data Employe</Button>
        </Form>
      </Drawer>
      <Paper
        radius='md'
        p='sm'
        withBorder
        style={{
          borderWidth: "0px 0px 0px 5px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}>
        <Title order={3}>Employee</Title>
      </Paper>
      <Button onClick={() => setOpened(true)}>Add Employee</Button>
    </>
  );
}
