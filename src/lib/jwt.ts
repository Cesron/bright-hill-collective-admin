import { sign, verify } from "jsonwebtoken"

const AUTH_SECRET = process.env.AUTH_SECRET as string
const REFRESH_SECRET = process.env.REFRESH_SECRET as string

export function generateTokens(
  userId: string,
  accessJti: string,
  refreshJti: string,
) {
  const accessToken = sign({ userId, jti: accessJti }, AUTH_SECRET, {
    expiresIn: "15m",
  })

  const refreshToken = sign({ userId, jti: refreshJti }, REFRESH_SECRET, {
    expiresIn: "7d",
  })

  return { accessToken, refreshToken }
}

export function verifyAccessToken(accessToken?: string) {
  try {
    if (!accessToken) return null

    const verified = verify(accessToken, AUTH_SECRET) as {
      userId: string
      jti: string
    }

    return verified
  } catch {
    return null
  }
}

export function verifyRefreshToken(refreshToken?: string) {
  try {
    if (!refreshToken) return null

    const verified = verify(refreshToken, REFRESH_SECRET) as {
      userId: string
      jti: string
    }

    return verified
  } catch {
    return null
  }
}
