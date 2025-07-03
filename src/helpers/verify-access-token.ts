import { UserTokens } from "@/types/user"

const baseUrl = process.env.SITE_URL

export async function verifyTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined,
) {
  const response = await fetch(`${baseUrl}/api/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessToken }),
  })

  if (response.ok) {
    return true
  }

  if (response.status !== 401) {
    return false
  }

  const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!refreshResponse.ok) {
    return false
  }

  const data = await refreshResponse.json()
  return data as UserTokens
}
