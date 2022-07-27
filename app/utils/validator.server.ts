export const validateEmail = (email: string): string | undefined => {
  let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.length || !validEmail.test(email)) {
    return "Please enter a valid email address";
  }
};

export const validatePasswordHash = (
  passwordHash: string
): string | undefined => {
  if (passwordHash.length < 6) {
    return "Password min 6 characters";
  }
};

export const validateConfirmPassword = (
  password1: string,
  password2: string
): string | undefined => {
  if (password1 !== password2) {
    return "Password not Match";
  }
};

// import { z } from "zod";
// import type { RegisterForm } from "./types.server";

// const registerSchema = z.object({
//   email: z
//     .string({
//       required_error: "Email is required",
//     })
//     .email("Not a valid email"),
//   passwordHash: z
//     .string({
//       required_error: "Password is Required",
//     })
//     .min(6, { message: "Password must be 6 characters" }),
//   confirmPassword: z
//     .string({
//       required_error: "Password is Required",
//     })
//     .min(6, { message: "Password must be 6 characters" }),
// });

// export const validateRegister = ({
//   email,
//   passwordHash,
//   confirmPassword,
// }: RegisterForm) => {
//   try {
//     registerSchema.parse({
//       email,
//       passwordHash,
//       confirmPassword,
//     });
//     return null;
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return error.flatten().fieldErrors;
//     }
//   }
// };
