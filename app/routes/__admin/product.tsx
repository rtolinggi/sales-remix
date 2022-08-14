import {
  Button,
  Divider,
  Drawer,
  Grid,
  Group,
  Input,
  LoadingOverlay,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import {
  IconChevronDown,
  IconCirclePlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons";
import React, { useEffect, useRef, useState } from "react";
import {
  createCategory,
  createProduct,
  deleteCategory,
  getCategory,
  updateCategory,
} from "~/controllers/product.server";
import { requireUserId } from "~/utils/session.server";
import type { categorys, suppliers } from "@prisma/client";
import { useFocusTrap } from "@mantine/hooks";
import { getSupplier } from "~/controllers/supplier.server";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";

type LoaderProps = {
  success: boolean;
  category: Array<categorys>;
  supplier: Array<suppliers>;
  user: string;
};

const schema = Z.object({
  productId: Z.string().optional(),
  productName: Z.string({
    required_error: "Product Name is Required",
  }),
  categoryId: Z.string({
    required_error: "Category Id is Required",
  }),
  supplierId: Z.string({
    required_error: "Supplier Id is Required",
  }),
  price: Z.number().positive(),
  description: Z.string({
    required_error: "Description is Required",
  }),
  action: Z.string().optional(),
}).refine(
  (data) => data.action === "insertProduct" || data.action === "updateProduct",
  {
    message: "Method Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const category = await getCategory();
  const supplier = await getSupplier();
  if (!user && !category) return false;
  return json(
    { success: true, category: category, supplier: supplier, user },
    { status: 200 }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const formDataCategory = await request.formData();
  const categoryName = formDataCategory.get("categoryName");
  const categoryId = formDataCategory.get("categoryId");
  const action = formDataCategory.get("action");

  if (typeof action !== "string")
    return json({ success: false, message: "typof action" }, { status: 400 });
  // Delete Category
  if (request.method === "DELETE" && action === "deleteCategory") {
    if (typeof categoryId !== "string")
      return json({ success: false }, { status: 400 });
    const result = await deleteCategory(JSON.parse(categoryId as string));
    if (!result)
      return json(
        { success: false, message: "delete category" },
        { status: 400 }
      );
    return json({ success: true }, { status: 200 });
  }

  // Post Category

  if (request.method === "POST" && action === "createCategory") {
    if (typeof categoryName !== "string")
      return json(
        { success: false, message: "typeof categoryname" },
        { status: 400 }
      );
    const addCategory = await createCategory(categoryName as string);
    if (!addCategory)
      return json(
        { success: false, message: "post category" },
        { status: 400 }
      );
    return json({ success: true }, { status: 200 });
  }

  // Update Category
  if (request.method === "PUT" && action === "updateCategory") {
    if (typeof categoryId !== "string" && typeof categoryName !== "string")
      return json(
        { success: false, message: "typeof categoryId" },
        { status: 400 }
      );

    const putCategory = await updateCategory(
      categoryId as string,
      categoryName as string
    );
    if (!putCategory)
      return json(
        { success: false, message: "updateCategory" },
        { status: 400 }
      );
    return json({ success: true }, { status: 200 });
  }

  console.log("START PRODUCT");

  // Post Product
  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  console.log("PREPARE PRODUCT");

  if (errors) return json({ success: false, error: errors }, { status: 500 });

  console.log("FINISH");

  if (request.method === "POST" && formData.action === "createProduct") {
    console.log("CREATE PRODUCT");
    const dataProduct = {
      productName: formData.productName,
      categoryId: formData.categoryId,
      supplierId: formData.supplierId,
      price: String(formData.price),
      description: formData.description,
    };
    const insertProduct = await createProduct(dataProduct);
    if (!insertProduct) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }
};

export default function Product() {
  const { category, supplier } = useLoaderData<LoaderProps>();
  const submit = useSubmit();
  const transition = useTransition();
  const inputCategoryRef = useRef<HTMLInputElement | null>(null);
  const focusTrapRef = useFocusTrap();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(false);
  const [actionUpdateCategory, setActionUpdateCategory] =
    useState<boolean>(false);
  const [actionUpdate, setActionUpdate] = useState<boolean>(false);
  const [stateCategoryId, setStateCategoryId] = useState<string>("");

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "createCategory"
    ) {
      if (null !== inputCategoryRef.current) {
        inputCategoryRef.current.value = "";
        inputCategoryRef.current.focus();
      }
    }

    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "updateCategory"
    ) {
      if (null !== inputCategoryRef.current) {
        inputCategoryRef.current.value = "";
        inputCategoryRef.current.focus();
      }
      setActionUpdateCategory(false);
      setStateCategoryId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

  return (
    <>
      <Modal
        opened={openModal}
        size="md"
        onClose={() => {
          setStateCategoryId("");
          setActionUpdateCategory(false);
          setOpenModal(false);
        }}
        title="Category Product"
      >
        <LoadingOverlay
          visible={
            transition.submission?.formData.get("action") ===
              "deleteCategory" ||
            transition.submission?.formData.get("action") ===
              "createCategory" ||
            transition.submission?.formData.get("action") === "updateCategory"
              ? true
              : false
          }
        />
        <Divider my={15} />
        <Stack spacing="lg" ref={focusTrapRef}>
          <Form method={actionUpdateCategory ? "put" : "post"}>
            <Grid align="center" columns={6} grow justify="center">
              <Grid.Col span={4}>
                {actionUpdateCategory ? (
                  <Input
                    type="hidden"
                    name="categoryId"
                    value={stateCategoryId}
                  />
                ) : undefined}
                <Input
                  ref={inputCategoryRef}
                  placeholder="Add Category"
                  name="categoryName"
                  data-autofocus
                  required
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <Button
                  type="submit"
                  name="action"
                  value={
                    actionUpdateCategory ? "updateCategory" : "createCategory"
                  }
                  leftIcon={<IconCirclePlus size={20} />}
                >
                  {actionUpdateCategory ? "Update" : "Insert"}
                </Button>
              </Grid.Col>
            </Grid>
          </Form>
          <ScrollArea style={{ height: "15rem" }}>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Category Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {category.map((item, index) => {
                  return (
                    <tr key={item.categoryId}>
                      <td>{index + 1}</td>
                      <td>{item.categoryName}</td>
                      <td>
                        <Group spacing="xs">
                          <ThemeIcon
                            color="red"
                            variant="light"
                            style={{ cursor: "pointer", marginRight: "10px" }}
                          >
                            <UnstyledButton
                              onClick={() => {
                                submit(
                                  {
                                    action: "deleteCategory",
                                    categoryId: JSON.stringify(item.categoryId),
                                  },
                                  { method: "delete" }
                                );
                              }}
                            >
                              <IconTrash size={20} stroke={1.5} />
                            </UnstyledButton>
                          </ThemeIcon>
                          <ThemeIcon
                            color="lime"
                            variant="light"
                            style={{ cursor: "pointer" }}
                          >
                            <UnstyledButton
                              name="action"
                              value="updateStore"
                              onClick={() => {
                                setActionUpdateCategory(true);
                                setStateCategoryId(String(item.categoryId));
                                if (null !== inputCategoryRef.current) {
                                  inputCategoryRef.current.value =
                                    item.categoryName;
                                  inputCategoryRef.current.focus();
                                }
                              }}
                            >
                              <IconEdit size={20} stroke={1.5} />
                            </UnstyledButton>
                          </ThemeIcon>
                        </Group>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </ScrollArea>
          <Divider my={15} />
          {actionUpdateCategory ? (
            <Button
              onClick={() => {
                setActionUpdateCategory(false);
                setStateCategoryId("");
                if (null !== inputCategoryRef.current) {
                  inputCategoryRef.current.value = "";
                }
              }}
            >
              Cancel Update
            </Button>
          ) : undefined}
        </Stack>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => {
          setActionUpdate(false);
          setOpened(false);
        }}
        title="Products"
        padding="xl"
        size="xl"
        position="right"
      >
        {/* Drawer content */}
        <Form method={actionUpdate ? "put" : "post"}>
          <Stack spacing="sm" align="stretch">
            {actionUpdate ? (
              <TextInput
                name="productId"
                // value={String(dataSupplier[1])}
                type="hidden"
              />
            ) : undefined}
            <TextInput
              // defaultValue={actionUpdate ? dataSupplier[2] : undefined}
              variant="filled"
              name="productName"
              placeholder="Product Name"
              label="Product Name"
              required
            />
            <Select
              data={category.map((item) => {
                return {
                  value: String(item.categoryId),
                  label: item.categoryName,
                };
              })}
              name="categoryId"
              rightSection={<IconChevronDown size={16} />}
              variant="filled"
              label="Category"
              searchable
              clearable
              placeholder="Select Category"
              required
            />
            <Select
              data={supplier.map((item) => {
                return {
                  value: String(item.supplierId),
                  label: item.supplierName,
                };
              })}
              name="supplierId"
              rightSection={<IconChevronDown size={16} />}
              variant="filled"
              label="Supplier"
              searchable
              clearable
              placeholder="Select Supplier"
              required
            />
            <NumberInput
              name="price"
              label="Price"
              placeholder="Rp. "
              required
            />
            <Textarea
              // defaultValue={actionUpdate ? dataSupplier[4] : undefined}
              variant="filled"
              name="description"
              placeholder="Description"
              label="description"
            />
          </Stack>
          <Button
            type="submit"
            mt={20}
            name="action"
            value={actionUpdate ? "updateProduct" : "createProduct"}
          >
            {actionUpdate ? "Update" : "Insert"}
          </Button>
        </Form>
      </Drawer>
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
        <Title order={3}>Product</Title>
      </Paper>
      <Group spacing="xs">
        <Button
          onClick={() => setOpened(true)}
          leftIcon={<IconCirclePlus size={20} />}
        >
          Add Product
        </Button>
        <Button
          onClick={() => {
            setOpenModal(true);
          }}
          leftIcon={<IconCirclePlus size={20} />}
        >
          Add Category
        </Button>
      </Group>
    </>
  );
}
