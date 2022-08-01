import { object, ZodError, ZodSchema } from "zod";

type ActionError<T> = Record<keyof T>
export const validateAction<ActionInput>= async ({
  request,
  schema,
}: {
  request: Request;
  schema: ZodSchema;
}) => {
  const body = Object.fromEntries(await request.formData());

  try {
    const formData = schema.parse(body) as ActionInput;
    return {
      formData,
      errors: null,
    };
  } catch (err) {
    console.error(err);
    const errors = err as ZodError<ActionInput>;
    return {
      FormData: body,
      errors: errors.issues.reduce((acc, curr) => {
        const key = curr.path[0];
        acc[key] = curr.message;
        return acc;
      }, {}),
    };
  }
};
