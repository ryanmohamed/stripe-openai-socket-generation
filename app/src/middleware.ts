import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from 'next-auth/react';
 
const serverURL: string = process.env.NODE_ENV === 'production' ? "/" : `http://localhost:3001/api`;

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  
  // use middleware to securely verify the user is in the room
  if(request.nextUrl.pathname.startsWith("/rooms/")) {
    const sessionTokenCookie = request.cookies.get("next-auth.session-token");
    if (sessionTokenCookie === null || sessionTokenCookie === undefined)  //session token not found
      return NextResponse.redirect(new URL('/404', request.url)); 
    
    const roomID = request.nextUrl.pathname.substring(7);
    const validRoom: boolean = roomID.match(/^\d{6}$/) ? true : false;
    if (!validRoom) return NextResponse.redirect(new URL('/404', request.url)); // invalid room id

    /*
      memberhood in server room is dictated by user 
      session id, provide the token and let server 
      directly query the database for more security
    */
    const sessionToken = sessionTokenCookie.value;
    const response = await fetch(`${serverURL}?room=${roomID}`, { 
      method: "GET",
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer xxx", // token to signify the authorization of the reqest from the web app server
        "x-session-token-cookie": `${sessionToken}`,
      },
    });
    if (response?.status !== 200) return NextResponse.redirect(new URL('/404', request.url)); // todo: replace with redirect to 500 status code page
    console.log("\n\n\n\n", roomID, "\n\n\n\n");
  }
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/rooms/:path?',
}