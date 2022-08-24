import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import bcrypt from "bcryptjs";
import { constant } from "~/config/constant";
import * as Z from "zod";
import jwt from "jsonwebtoken";

const schema = Z.object({
  email: Z.string().email(),
  passwordHash: Z.string().min(6),
});

type BodyRequest = Z.infer<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  if (request.method === "POST") {
    const body: BodyRequest = await request.json();
    const validateInput = schema.safeParse(body);

    if (!validateInput.success) {
      const { email, passwordHash } = validateInput.error.format();
      return json(
        { success: false, errors: { email, passwordHash } },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: {
        email: body.email,
      },
    });

    if (
      !user ||
      !(await bcrypt.compare(body.passwordHash, user.passwordHash))
    ) {
      return json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
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
          { status: 401 }
        );
      }
      if (!user.isActive) {
        return json(
          {
            success: false,
            message:
              "Account Not Activation, Please Contact your Adminsitrator",
          },
          { status: 401 }
        );
      }
    }
    const refreshToken = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
      },
      String(constant.JWT_REFRESH_TOKEN),
      {
        expiresIn: "30d",
      }
    );

    await prisma.users.update({
      where: {
        userId: user.userId,
      },
      data: {
        refreshToken,
      },
    });

    return json(
      {
        success: true,
        data: { userId: user.userId, email: user.email, refreshToken },
      },
      { status: 200 }
    );
  }
};
