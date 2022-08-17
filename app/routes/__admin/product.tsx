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
  Text,
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
  createProduct,
  deleteProduct,
  getCategory,
  getProduct,
  updateProduct,
} from "~/controllers/product.server";
import { requireUserId } from "~/utils/session.server";
import type { categorys, suppliers } from "@prisma/client";
import { useFocusTrap } from "@mantine/hooks";
import { getSupplier } from "~/controllers/supplier.server";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";
import DataTable from "~/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { ExportToExcel } from "~/components/ExportData";

type ProductTable = {
  productId: string;
  categoryId: string;
  supplierId: string;
  productName: string;
  price: string;
  description: string;
  categoryName: string;
  supplierName: string;
  createdAt: string;
  updatedAt: string;
};

type LoaderProduct = {
  productId: number;
  categoryId: number;
  supplierId: number;
  productName: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  categorys: {
    categoryName: string;
  };
  suppliers: {
    supplierName: string;
  };
};

type LoaderProps = {
  success: boolean;
  category: Array<categorys>;
  supplier: Array<suppliers>;
  product: Array<LoaderProduct>;
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
  price: Z.string(),
  description: Z.string({
    required_error: "Description is Required",
  }),
  action: Z.string().optional(),
}).refine(
  (data) =>
    data.action === "createProduct" ||
    data.action === "updateProduct" ||
    data.action === "deleteProduct",
  {
    message: "Method Not Allowed",
    path: ["action"],
  }
);

const visibility = {
  productId: false,
  supplierId: false,
  categoryId: false,
};

export type ActionInput = Z.infer<typeof schema>;

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const category = await getCategory();
  const supplier = await getSupplier();
  const product = await getProduct();
  if (!supplier && !category) return false;
  return json(
    {
      success: true,
      product: product,
      category: category,
      supplier: supplier,
      user,
    },
    { status: 200 }
  );
};

export const action: ActionFunction = async ({ request }) => {
  // Delete
  if (request.method === "DELETE") {
    const { productId, action } = Object.fromEntries(await request.formData());
    if (
      typeof productId === "string" &&
      typeof action === "string" &&
      action === "deleteProduct"
    ) {
      const result = await deleteProduct(productId);
      if (!result) return json({ success: false }, { status: 400 });
      return json({ success: true }, { status: 200 });
    }
    return false;
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
  if (request.method === "POST" && newFormData.action === "createProduct") {
    delete newFormData.action;
    const result = await createProduct(newFormData);
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

  if (request.method === "PUT" && newFormData.action === "updateProduct") {
    delete newFormData.action;
    const result = await updateProduct(newFormData);
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }
};

export default function Product() {
  const { category, supplier, product } = useLoaderData<LoaderProps>();
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
  const [dataProduct, setDataProduct] = useState<Array<string>>([]);

  const data: Array<ProductTable> = product.map((item) => {
    const dataTable = {
      productId: item.productId.toString(),
      categoryId: item.categoryId.toString(),
      supplierId: item.supplierId.toString(),
      productName: item.productName,
      price: item.price.toString(),
      description: item.description,
      categoryName: item.categorys.categoryName,
      supplierName: item.suppliers.supplierName,
      createdAt: JSON.stringify(String(item.createdAt)),
      updatedAt: JSON.stringify(String(item.updatedAt)),
    };
    return dataTable;
  });

  const columns = React.useMemo<ColumnDef<ProductTable, any>[]>(
    () => [
      {
        id: "no",
        header: "No.",
        cell: (props) => parseInt(props.row.id) + 1,
      },
      {
        id: "productId",
        accessorKey: "productId",
      },
      {
        id: "categoryId",
        accessorKey: "categoryId",
      },
      {
        id: "supplierId",
        accessorKey: "supplierId",
      },
      {
        id: "productName",
        accessorKey: "productName",
        header: "Product Name",
      },
      {
        id: "price",
        accessorKey: "price",
        header: "Price Rp.",
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
      },
      {
        id: "categoryName",
        accessorKey: "categoryName",
        header: "Category Name",
      },
      {
        id: "supplierName",
        accessorKey: "supplierName",
        header: "Supplier Name",
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
      },
      {
        id: "updatedAt",
        accessorKey: "updatedAt",
      },
      {
        id: "action",
        header: "Actions",
        cell: (props) => {
          const idProduct = props.row
            .getAllCells()
            .map((item) => item.getValue());
          return (
            <Group spacing="xs">
              <ThemeIcon
                color="red"
                variant="light"
                style={{ cursor: "pointer", marginRight: "10px" }}
              >
                <UnstyledButton
                  onClick={() =>
                    openConfirmModal({
                      title: "Delete Product",
                      centered: true,
                      children: (
                        <Text size="sm">
                          Are you sure you want to delete employee{" "}
                          {idProduct[4] as string}?
                        </Text>
                      ),
                      labels: {
                        confirm: "Delete Product",
                        cancel: "No don't delete it",
                      },
                      onCancel: () => console.log("Cancel"),
                      onConfirm: () => {
                        submit(
                          {
                            action: "deleteProduct",
                            productId: idProduct[1] as string,
                          },
                          { method: "delete" }
                        );
                      },
                    })
                  }
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
                  type="submit"
                  name="action"
                  value="updateEmploye"
                  onClick={() => {
                    setActionUpdate(true);
                    setDataProduct(idProduct as Array<string>);
                    setOpened(true);
                  }}
                >
                  <IconEdit size={20} stroke={1.5} />
                </UnstyledButton>
              </ThemeIcon>
            </Group>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "createProduct"
    ) {
      showNotification({
        id: "loadingData",
        title: "Create Product",
        message: "Create Product Successfully",
        autoClose: true,
      });
      setActionUpdate(false);
      setOpened(false);
    }
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "updateProduct"
    ) {
      showNotification({
        id: "loadingData",
        title: "Update Product",
        message: "Update Product Successfully",
        autoClose: true,
      });
      setActionUpdate(false);
      setOpened(false);
    }
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "deleteProduct"
    ) {
      showNotification({
        id: "loadingData",
        title: "Delete Product",
        message: "Delete Product Successfully",
        autoClose: true,
      });
      setActionUpdate(false);
      setOpened(false);
    }
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
          <Form
            method={actionUpdateCategory ? "put" : "post"}
            action="/category"
          >
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
                                  {
                                    method: "delete",
                                    action: "/category",
                                  }
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
                value={String(dataProduct[1])}
                type="hidden"
              />
            ) : undefined}
            <TextInput
              defaultValue={actionUpdate ? dataProduct[4] : undefined}
              variant="filled"
              name="productName"
              placeholder="Product Name"
              label="Product Name"
              required
            />
            <Select
              defaultValue={actionUpdate ? String(dataProduct[2]) : undefined}
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
              defaultValue={actionUpdate ? String(dataProduct[3]) : undefined}
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
              defaultValue={actionUpdate ? parseInt(dataProduct[5]) : undefined}
              variant="filled"
              name="price"
              label="Price"
              placeholder="Rp. "
              required
            />
            <Textarea
              defaultValue={actionUpdate ? dataProduct[6] : undefined}
              variant="filled"
              name="description"
              placeholder="Description"
              label="Description"
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
      <Group position="apart" mx={10}>
        <Group spacing="xs">
          <Button
            onClick={() => setOpened(true)}
            leftIcon={<IconCirclePlus size={20} />}
          >
            Create Product
          </Button>
          <Button
            onClick={() => {
              setOpenModal(true);
            }}
            leftIcon={<IconCirclePlus size={20} />}
          >
            Create Category
          </Button>
        </Group>
        <Group position="right">
          <ExportToExcel apiData={data} fileName={"product"} />
        </Group>
      </Group>

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
        <DataTable data={data} columns={columns} visibility={visibility} />
      </Paper>
    </>
  );
}
