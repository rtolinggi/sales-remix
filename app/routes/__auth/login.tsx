import {
  Anchor,
  Button,
  Center,
  Checkbox,
  Divider,
  Group,
  Image,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Space,
  TextInput,
  Title,
} from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import logoN from "~/assets/logo-N.png";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import type { RegisterForm } from "~/utils/types.server";
import { login, register } from "~/controllers/auth.server";
import { showNotification } from "@mantine/notifications";
import {
  validateConfirmPassword,
  validateEmail,
  validatePasswordHash,
} from "~/utils/validator.server";
import { Check } from "tabler-icons-react";

type Error = {
  email?: string;
  passwordHash?: string;
  confirmPassword?: string;
};

type ActionData = {
  success: boolean;
  errors: Error;
  message?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  const email = formData.get("email");
  const passwordHash = formData.get("passwordHash");
  let confirmPassword = formData.get("confirmPassword");

  if (
    typeof email !== "string" ||
    typeof passwordHash !== "string" ||
    typeof action !== "string"
  ) {
    return json(
      { success: false, form: action, message: "Invalid form data" },
      { status: 400 }
    );
  }

  if (action === "register" && typeof confirmPassword !== "string") {
    return json(
      { success: false, form: action, message: "Invalid form data" },
      { status: 400 }
    );
  }

  const fieldValidate = (action: string) => {
    if (action === "register") {
      confirmPassword = confirmPassword as string;
      return {
        email: validateEmail(email),
        passwordHash: validatePasswordHash(passwordHash),
        confirmPassword: validateConfirmPassword(passwordHash, confirmPassword),
      };
    }
    return {
      email: validateEmail(email),
      passwordHash: validatePasswordHash(passwordHash),
    };
  };

  const fieldErrors = fieldValidate(action);
  if (Object.values(fieldErrors).some(Boolean))
    return json(
      {
        success: false,
        errors: fieldErrors,
      },
      { status: 400 }
    );

  switch (action) {
    case "login": {
      return await login({ email, passwordHash });
    }
    case "register": {
      confirmPassword = confirmPassword as string;
      return await register({ email, passwordHash, confirmPassword });
    }
    default:
      return json(
        { success: false, message: "Invalid form data" },
        { status: 400 }
      );
  }
};

const Login = () => {
  const trasition = useTransition();
  const [visible, setVisible] = useState<boolean>(false);
  const actionData = useActionData<ActionData>();
  const [fieldErrors, setFieldErrors] = useState<Error>({});
  const [action, setAction] = useState<string>("login");
  const [formData, setFormData] = useState<RegisterForm>({
    email: actionData?.errors?.email || "",
    passwordHash: actionData?.errors?.passwordHash || "",
    confirmPassword: actionData?.errors?.confirmPassword || "",
  });

  const firstLoadRef = useRef<boolean>(true);

  useEffect(() => {
    if (actionData?.message) {
      if (
        actionData?.success &&
        actionData.message ===
          "Register Success, Please Check youre email to activation account"
      ) {
        setAction("login");
      }
      showMessage(
        actionData?.success ? "Success" : "Error",
        actionData?.message,
        actionData?.success ? true : false
      );
    }
    setFieldErrors(actionData?.errors || {});
  }, [actionData]);

  useEffect(() => {
    if (trasition.state === "submitting") {
      setVisible(true);
    }
    if (trasition.state === "idle") {
      setVisible(false);
    }
  }, [trasition]);

  useEffect(() => {
    if (!firstLoadRef.current) {
      const newState = {
        email: "",
        passwordHash: "",
        confirmPassword: "",
      };
      setFieldErrors(newState);
      setFormData(newState);
    }
  }, [action]);

  useEffect(() => {
    firstLoadRef.current = false;
  }, []);

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({
      ...form,
      [field]: event.target.value,
    }));
  };

  const handleActionChange = () => {
    let value: string;
    value = action === "login" ? "register" : "login";
    setFormData({ email: "", passwordHash: "", confirmPassword: "" });
    setAction(value);
  };

  const showMessage = (title: string, message: string, success: boolean) => {
    return showNotification({
      title,
      message,
      icon: success ? <Check /> : null,
      color: success ? "teal" : "red",
    });
  };

  return (
    <Paper
      withBorder
      shadow="md"
      p={30}
      radius="md"
      sx={(theme) => ({
        background:
          theme.colorScheme === "dark"
            ? "rgba(0,0,0,0.6)"
            : "rgba(255,255,255,0.1)",
        backdropFilter: "blur(8px)",
        minWidth: "320px",
        margin: "auto",
      })}
    >
      <LoadingOverlay visible={visible} />
      <Center>
        <Image src={logoN} alt="logo" width={100} />
      </Center>
      <Center>
        <Title align="left" order={2}>
          {action === "login" ? "Sign in" : "Sign up"}
        </Title>
      </Center>
      <Space h="md" />
      <Form method="post">
        <TextInput
          name="email"
          label="Email"
          placeholder="Your email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => handleChangeInput(e, "email")}
          error={fieldErrors?.email}
          required
        />
        <PasswordInput
          name="passwordHash"
          label="Password"
          placeholder="Your password"
          autoComplete="password"
          value={formData.passwordHash}
          onChange={(e) => handleChangeInput(e, "passwordHash")}
          error={fieldErrors?.passwordHash}
          required
          mt="md"
        />
        {action !== "login" ? (
          <PasswordInput
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Repeat password"
            autoComplete="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChangeInput(e, "confirmPassword")}
            error={fieldErrors?.confirmPassword}
            required
            mt="md"
          />
        ) : null}
        {action === "login" ? (
          <Group position="apart" mt="md">
            <Checkbox label="Remember me" />
            <Anchor component={Link} to="#" size="sm">
              Forgot password?
            </Anchor>
          </Group>
        ) : null}
        <Button
          fullWidth
          mt="xl"
          name="_action"
          value={action}
          type="submit"
          loading={trasition.state === "submitting"}
        >
          {action === "login" ? "Sign in" : "Sign up"}
        </Button>
        <Divider
          my="xs"
          label={
            action === "login"
              ? "Dont have an account?"
              : "Already have an account?"
          }
          labelPosition="center"
        />
        <Button
          onClick={() => handleActionChange()}
          variant="outline"
          fullWidth
        >
          {action === "login" ? "Sign up" : "Sign in"}
        </Button>
      </Form>
    </Paper>
  );
};

export default Login;
