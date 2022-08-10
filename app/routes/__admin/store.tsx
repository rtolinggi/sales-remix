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
import * as Z from "zod";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { IconPlus } from "@tabler/icons";
import { useState } from "react";
import { requireUserId } from "~/utils/session.server";
import { validateAction } from "~/utils/validate.server";
import { createStore } from "~/controllers/store.server";

const schema = Z.object({
  storeName: Z.string({
    required_error: "Store Name is required",
  }),
  ownerName: Z.string({
    required_error: "Owner Name is required",
  }),
  address: Z.string(),
  phone: Z.string(),
  action: Z.string().optional(),
}).refine(
  (data) => data.action === "createStore" || data.action === "updateEmploye",
  {
    message: "Action Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  // Post
  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });
  console.log(errors);
  const newFormdata = { ...formData };

  if (request.method === "POST" && newFormdata.action === "createStore") {
    delete newFormdata.action;
    const result = await createStore(newFormdata);
    console.log(result);
    return result;
  }
  return json({ success: false }, { status: 500 });
};

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
        title='Create Store'
        padding='xl'
        size='xl'
        position='right'>
        {/* Drawer content */}
        <Form method='post'>
          <Stack spacing='sm' align='stretch'>
            <TextInput
              variant='filled'
              name='storeName'
              label='Store Name'
              required
            />
            <TextInput
              variant='filled'
              name='ownerName'
              label='Owner Name'
              required
            />
            <NumberInput
              variant='filled'
              name='phone'
              hideControls
              label='No Handphone'
              required
            />
            <Select
              variant='filled'
              data={["Cluster A", "Cluister B", "Cluster C"]}
              name='clusterId'
              searchable
              clearable
              placeholder='Select Cluster'
              label='Cluster Name'
              required
            />
            <Select
              variant='filled'
              data={["Sub Cluster A", "Sub Cluister B", "Sub Cluster C"]}
              name='subClusterId'
              searchable
              clearable
              placeholder='Select Sub Cluster'
              label='Sub Cluster Name'
              required
            />

            <Textarea
              variant='filled'
              name='address'
              placeholder='Address'
              label='Address'
              required
            />
          </Stack>
          <Button
            leftIcon={<IconPlus size={20} color='white' />}
            type='submit'
            mt={20}
            name='action'>
            Save
          </Button>
        </Form>
      </Drawer>

      <Paper
        radius='md'
        p='sm'
        withBorder
        style={{
          borderLeftWidth: "5px",
          borderBottomWidth: "0px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}>
        <Title order={3}>Store</Title>
      </Paper>
      <Button
        leftIcon={<IconPlus size={20} color='white' />}
        onClick={() => setOpened(true)}>
        Add Store
      </Button>
    </>
  );
}
