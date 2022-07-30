import { prisma } from "../utils/prisma.server";

export const getEmail = async () => {
  try {
    const email = await prisma.users.findMany({
      include: {
        employees: true,
      },
      where: {
        employees: null,
      },
    });
    return email;
  } catch (err) {
    console.log(err);
    return err;
  }
};
