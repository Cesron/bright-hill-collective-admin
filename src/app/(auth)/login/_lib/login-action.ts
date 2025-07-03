"use server"

import { loginSchema } from "./login-schema"
import { CustomError } from "@/helpers/custom-error"
import { setAuth } from "@/helpers/set-auth"
import { compare } from "bcrypt"
import { redirect } from "next/navigation"

import { generateTokens } from "@/lib/jwt"
import { actionClient } from "@/lib/safe-action"
import { sql } from "@/lib/sql"

const FIFTEEN_MINUTES = 15 * 60 * 1000

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput

    const result =
      await sql`SELECT id, hashed_password FROM users WHERE email = ${email}`
    const user = result[0]

    if (!user) {
      throw new CustomError("Invalid email or password")
    }

    const isPasswordValid = await compare(password, user.hashed_password)

    if (!isPasswordValid) {
      throw new CustomError("Invalid email or password")
    }

    const accessJti = crypto.randomUUID()
    const refreshJti = crypto.randomUUID()

    const { accessToken, refreshToken } = generateTokens(
      user.id,
      accessJti,
      refreshJti,
    )

    const expirationDate = new Date(Date.now() + FIFTEEN_MINUTES)

    await sql`
        INSERT INTO user_logins (user_id, access_jti, refresh_jti, expiration_date)
        VALUES (${user.id}, ${accessJti}, ${refreshJti}, ${expirationDate})
    `

    await setAuth(accessToken, refreshToken)

    redirect("/")
  })
