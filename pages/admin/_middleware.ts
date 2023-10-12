import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
// import { jwt } from "../../utils";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("MIDDLEWARE SESSION", { session });

  if (!session) {
    const requestedPage = req.page.name;
    return NextResponse.redirect(`/auth/login?p=${requestedPage}`);
  }

  const validRoles = ["admin", "super-user", "SEO"];

  if (!validRoles.includes(session.user.role!)) {
    return NextResponse.redirect("/");
  }

  return NextResponse.next();
}
