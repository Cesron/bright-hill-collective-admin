import { cookies } from "next/headers"

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
const FIFTEEN_MINUTES = 15 * 60 * 1000

export async function setAuth(accessToken: string, refreshToken: string) {
  const cookieContext = await cookies()

  cookieContext.set("access_token", accessToken, {
    expires: new Date(Date.now() + FIFTEEN_MINUTES),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })

  cookieContext.set("refresh_token", refreshToken, {
    expires: new Date(Date.now() + SEVEN_DAYS),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })
}
