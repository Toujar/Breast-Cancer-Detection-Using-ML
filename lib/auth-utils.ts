// lib/auth-utils.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export function requireUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    throw new Error("UNAUTHORIZED");
  }
}
