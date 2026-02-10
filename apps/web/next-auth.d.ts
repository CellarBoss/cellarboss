import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      admin: boolean;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    admin: boolean;
    username: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    user: {
      id: string;
      admin: boolean;
      username: string;
    };
  }
}