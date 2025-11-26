"use server";

import instance from "@/axios";
import { z } from "zod";

const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Input at least 2 character" }).trim(),
    companyName: z.string().min(1, { message: "Company name required" }).trim(),
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .trim(),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" })
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function signup(prevState: any, formData: FormData) {
  const result = signupSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, companyName, email, password } = result.data;

  try {
    const response = await instance.post("/api/signup", {
      name,
      email,
      companyName,
      password,
    });

    if (response.data.message === "User created successfully") {
      return {
        success: true,
        message: "Signup Successfull! You can login now",
      };
    }
  } catch (error: any) {
    if (error?.response?.data?.error === "User already exists") {
      return { success: false, message: "User Already Exist!" };
    } else {
      return {
        success: false,
        message: "We are facing some issue. Try Again!",
      };
    }
  }
}
