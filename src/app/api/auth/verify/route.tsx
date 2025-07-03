import { verifyAccessToken } from "@/lib/jwt"
import { sql } from "@/lib/sql"

export async function POST(req: Request) {
  const { accessToken } = await req.json()

  const verifiedAccessToken = verifyAccessToken(accessToken)

  if (!verifiedAccessToken) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { userId, jti } = verifiedAccessToken

  const [userResult, loginResult] = await Promise.all([
    sql`SELECT id FROM users WHERE id = ${userId}`,
    sql`SELECT id FROM user_logins WHERE user_id = ${userId} AND access_jti = ${jti}`,
  ])

  const user = userResult[0]
  const login = loginResult[0]

  if (!user || !login) {
    return new Response("Unauthorized", { status: 401 })
  }

  return Response.json(user)
}
