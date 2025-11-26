"use server";

import instance from "@/axios";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteSession } from "../lib/session";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  try {
    const response = await instance.post("/api/signin", {
      email,
      password,
    });

    const token = response.data.token;
    if (response.data.message === "User signed in successfully") {
      await createSession(token);
      return { success: true, data: response.data };
    }
  } catch (error: any) {
    if (error?.response?.data?.error)
      return { success: false, message: error.response.data.error };
    else
      return {
        success: false,
        message: "We are facing some issue. Try Again!",
      };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
