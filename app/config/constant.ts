export const constant = {
  NODE_ENV: process.env.NODE_ENV,
  EMAIL_VERIFICATION: process.env.EMAIL_VERIFICATION === "true" ? true : false,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
};
