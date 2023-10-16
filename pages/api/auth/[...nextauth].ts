import { GetServerSideProps } from "next";
import NextAuth, {
  Account,
  Awaitable,
  RequestInternal,
  Session,
  User,
  Profile,
  getServerSession,
  SessionStrategy,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import { dbUsers } from "@/database";
import { getSession } from "next-auth/react";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    Credentials({
      name: "Custom Login",
      credentials: {
        email: {
          label: "Correo",
          type: "email",
          placeholder: "correo@google.com",
        },
        password: {
          label: "Contrasenia",
          type: "password",
          placeholder: "Contrasenia",
        },
      },
      async authorize(credentials, req): Promise<User | null> {
        /* console.log(" >>>>>>>>>>>> CREDENTIAL ", { credentials });
        console.log("ESTO SOLO OCURRE EN LOGIN"); */
        return await dbUsers.checkUserEmailPassword(
          credentials!.email,
          credentials!.password
        );        
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    // ...add more providers here
  ],
  // Custom pages
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },

  // JWT settings
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  session: {
    maxAge: 259200,
    strategy: "jwt" as SessionStrategy,
    updateAge: 86400,
  },

  // Callbacks
  callbacks: {
    async jwt({
      token,
      user,
      account,
      profile,
    }: {
      token: JWT;
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile | undefined;
    }) {
      /* console.log(" >>>>>>>>>>>> JWT CALLBACK", {
        token,
        user,
        account,
        profile,
      });
      console.log(" >>>>>>>>>>>> ACCESS_", account?.access_token); */

      if (account) {
        token.accessToken = account.access_token;
      }
      switch (account?.type) {
        case "oauth":
          // TODO: crear usuario o verificar si existe en mi db
          token.user = await dbUsers.oAUthToDbUser(
            user?.email || "",
            user?.name || ""
          );
          break;
        case "credentials":
          token.user = user;
          break;

        default:
          break;
      }

      return token;
    },
    async session({
      session,
      user,
      token,
    }: {
      session: Session;
      token: JWT;
      user: AdapterUser;
    }) {
      /* console.log(" >>>>>>>>>>>> SESSION CALLBACK", { session, token, user });
      console.log(" >>>>>>>>>>>> ACCESS", token.accessToken);
      console.log(" >>>>>>>>>>>> USER", token.user); */
      session.accessToken = token.accessToken as string;
      session.user = token.user!;

      return session;
    },
  },
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query } = ctx;
  const session = await getSession(ctx);

  const { p = "/" } = query;

  if (session) {
    return {
      redirect: {
        destination: p.toString(),
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default NextAuth(authOptions);
