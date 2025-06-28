import { UserTokens } from "@/types/user"

export async function verifyAccessToken(
  accessToken: string | undefined,
  refreshToken: string | undefined,
) {
  if (!accessToken || !refreshToken) {
    return false
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    accessToken,
    refreshToken,
  } as UserTokens
}
