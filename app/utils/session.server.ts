import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { constant } from "~/config/constant";
import { logout } from "~/controllers/auth.server";
import { prisma } from "./prisma.server";

if (!constant.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

export const storage = createCookieSessionStorage({
  cookie: {
    name: "netflix-session",
    secure: constant.NODE_ENV === "production",
    secrets: [constant.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export const createUserSession = async (userId: string, redirecTo: string) => {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirecTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};

export const requireUserId = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const session = await getUsersession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
};

const getUserId = async (request: Request) => {
  const session = await getUsersession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
};

export const getUser = async (request: Request) => {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }
  try {
    const user = await prisma.users.findUnique({
      where: { userId },
      select: { userId: true, email: true, employees: true },
    });
    return user;
  } catch (error) {
    throw logout(request);
  }
};

export const getUsersession = (request: Request) => {
  return storage.getSession(request.headers.get("Cookie"));
};
