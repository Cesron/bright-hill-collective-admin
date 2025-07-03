import { sql } from "@/lib/sql"

export default async function Home() {
  const users = await sql`SELECT * FROM users`

  const user_logins = await sql`SELECT * FROM user_logins`

  return (
    <div>
      <pre>
        <code>{JSON.stringify(users, null, 2)}</code>
      </pre>

      <pre>
        <code>{JSON.stringify(user_logins, null, 2)}</code>
      </pre>
    </div>
  )
}
