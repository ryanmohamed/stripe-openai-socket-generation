import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from 'next-auth/react';
 
const serverURL: string = process.env.NODE_ENV === 'production' ? "/" : `http://localhost:3001/api`;

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  
  // use middleware to securely verify the user is in the room
  if(request.nextUrl.pathname.startsWith("/rooms/")) {
    const session = await getSession();
    console.log(session);

    const roomID = request.nextUrl.pathname.substring(7);
    const validRoom: boolean = roomID.match(/^\d{6}$/) ? true : false;
    if (!validRoom) return NextResponse.redirect(new URL('/404', request.url));

    const response = await fetch(serverURL, { 
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer xxx"
      },
      
    });
    if (response?.status !== 200) return NextResponse.redirect(new URL('/404', request.url));; // todo: replace with redirect to 500 status code page
    console.log(response)
    console.log(response?.json)


    console.log("\n\n\n\n", roomID, "\n\n\n\n");
  }
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/rooms/:path?',
}