import { json, redirect } from "@remix-run/node";
import { prisma } from "../utils/prisma.server";
import type { RegisterForm, LoginForm } from "../utils/types.server";
import bcrypt from "bcryptjs";
import {
  createUserSession,
  getUsersession,
  storage,
} from "~/utils/session.server";
import { constant } from "~/config/constant";
import createTtansporter from "~/utils/email.server";
import { bodyEmail } from "~/config/email";
import { createUser } from "~/models/users.server";

export const register = async (form: RegisterForm) => {
  const userExist = await prisma.users.count({
    where: {
      email: form.email,
    },
  });

  if (userExist) {
    return json(
      { success: false, message: "Email already exist" },
      { status: 400 }
    );
  }

  const newUser = await createUser(form);

  if (!newUser) {
    return json(
      {
        success: false,
        message: "Something went wrong trying to register user",
      },
      { status: 400 }
    );
  }

  createTtansporter(
    newUser.email,
    "Verification User",
    bodyEmail(`http://localhost:3000/verified/${newUser.token}`)
  );

  return json(
    {
      success: true,
      message:
        "Register Success, Please Check youre email to activation account",
    },
    { status: 200 }
  );
};

export const authLogin = async (form: LoginForm) => {
  const result = await login(form);
  if (result.status !== 200) return result;
  console.log(result.data.userId);
  return createUserSession(result.data.userId, "/dashboard");
};

export const login = async (form: LoginForm): Promise<any> => {
  const user = await prisma.users.findUnique({
    where: {
      email: form.email,
    },
  });

  if (!user || !(await bcrypt.compare(form.passwordHash, user.passwordHash))) {
    return json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 400 }
    );
  }

  if (constant.EMAIL_VERIFICATION) {
    if (!user.isVerified) {
      return json(
        {
          success: false,
          message:
            "Please verification email, check youre email to activate user",
        },
        { status: 400 }
      );
    }
    if (!user.isActive) {
      return json(
        {
          success: false,
          message: "Account Not Activation, Please Contact your Adminsitrator",
        },
        { status: 400 }
      );
    }
    return user;
  }

  return createUserSession(user.userId, "/dashboard");
};

export const logout = async (request: Request) => {
  const session = await getUsersession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
    status: 200,
    statusText: "logout",
  });
};

export const verifiedEmail = async (token: string) => {
  const idEmail = await prisma.verifiedEmail.findFirst({ where: { token } });

  if (!idEmail) {
    return json({
      success: false,
      message: "Token Invalid",
    });
  }

  const verified = await prisma.users.update({
    where: {
      userId: idEmail.userId,
    },
    data: {
      isVerified: true,
    },
  });

  if (!verified) {
    return json({
      success: false,
      message: "Somthing Wrong",
    });
  }

  const getEmploye = await prisma.employees.findFirst({
    where: {
      userId: idEmail.userId,
    },
  });

  if (!getEmploye) return redirect("/login");

  return createUserSession(verified.userId, "/dashboard");
};
