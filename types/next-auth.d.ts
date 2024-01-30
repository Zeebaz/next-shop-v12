import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` 
   * Received as a prop on the `SessionProvider` React Context
   **/
  interface Session {
    accessToken?: string;
    user: {
      _id?: string;
      role?: string;
    };
  }
}

/**
 * Returned by `getToken`   
**/
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    user: {
      _id?: string;
      role?: string;
    } & DefaultUser["user"];
  }
}
