import { generateTokens, verifyRefreshToken } from "@/lib/jwt"
import { sql } from "@/lib/sql"

const FIFTEEN_MINUTES = 15 * 60 * 1000

export async function POST(req: Request) {
  const { refreshToken } = await req.json()

  const verifiedRefreshToken = verifyRefreshToken(refreshToken)

  if (!verifiedRefreshToken) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { userId, jti } = verifiedRefreshToken

  const [userResult, loginResult] = await Promise.all([
    sql`SELECT id FROM users WHERE id = ${userId}`,
    sql`SELECT id FROM user_logins WHERE user_id = ${userId} AND refresh_jti = ${jti}`,
  ])

  const user = userResult[0]
  const login = loginResult[0]

  if (!user || !login) {
    return new Response("Unauthorized", { status: 401 })
  }

  const accessJti = crypto.randomUUID()
  const refreshJti = crypto.randomUUID()

  const generatedTokens = generateTokens(user.id, accessJti, refreshJti)

  const expirationDate = new Date(Date.now() + FIFTEEN_MINUTES)

  await sql`
        UPDATE user_logins
        SET access_jti = ${accessJti}, refresh_jti = ${refreshJti}, expiration_date = ${expirationDate}
        WHERE user_id = ${user.id} AND refresh_jti = ${jti}
    `

  return Response.json({
    accessToken: generatedTokens.accessToken,
    refreshToken: generatedTokens.refreshToken,
  })
}
