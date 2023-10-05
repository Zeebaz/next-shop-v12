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

  return NextResponse.next();

  // const { token = '' } = req.cookies;
  // // return new Response('No autorizado', {
  // //     status: 401
  // // });
  // try {
  //     await jwt.isValidToken( token );
  //     return NextResponse.next();
  // } catch (error) {
  //     // return Response.redirect('/auth/login');
  //     const requestedPage = req.page.name;
  //     return NextResponse.redirect(`/auth/login?p=${ requestedPage }`);
  // }
}
