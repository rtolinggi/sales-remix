import { prisma } from "../utils/prisma.server";
import type { RegisterForm } from "../utils/types.server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const createUser = async (user: RegisterForm) => {
  const { email, passwordHash } = user;
  const _passwordHash = await bcrypt.hash(passwordHash, 10);
  let token = crypto.randomBytes(32).toString("hex");
  const newUser = await prisma.users.create({
    data: {
      email,
      passwordHash: _passwordHash,
      verifiedEmail: {
        create: {
          token,
        },
      },
    },
  });
  return {
    id: newUser.userId,
    email: newUser.email,
    token: token,
  };
};

export const verifiedEmail = async (token: string) => {
  let idEmail = await prisma.verifiedEmail.findFirst({ where: { token } });
  let verified = await prisma.users.update({
    where: {
      userId: idEmail?.userId,
    },
    data: {
      isVerified: true,
    },
  });
  return {
    id: verified.userId,
    email: verified.email,
    verified: verified.isVerified,
  };
};
