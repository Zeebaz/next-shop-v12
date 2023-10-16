import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
// import { jwt } from "../../utils";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // console.log("MIDDLEWARE SESSION", { session });

  if (!session) {
    return new Response(JSON.stringify({ message: "Not authorized" }), {
      status: 401,
      headers: {
        "Content-type": "application/json",
      },
    });
  }


  const validRoles = ["admin", "super-user", "SEO"];

  if (!validRoles.includes(session.user.role!)) {
    return new Response(JSON.stringify({ message: "Not authorized" }), {
      status: 401,
      headers: {
        "Content-type": "application/json",
      },
    });
  }

  return NextResponse.next();
}
