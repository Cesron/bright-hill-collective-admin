import { decode } from "jsonwebtoken"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { sql } from "@/lib/sql"

export async function GET() {
  const cookieStore = await cookies()

  const accessToken = cookieStore.get("access_token")

  console.log("Access Token:", accessToken)

  if (!accessToken) {
    return redirect("/login")
  }

  const decoded = decode(accessToken.value) as { jti: string }
  const jti = decoded?.jti || ""

  console.log("Decoded Access Token:", decoded)

  await sql`DELETE FROM user_logins WHERE access_jti = ${jti}`

  cookieStore.set("access_token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  cookieStore.set("refresh_token", "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  redirect("/login")
}
