import { sql } from "@/lib/sql";

export default async function Home() {
  const users = await sql`SELECT * FROM users`;

  return (
    <div>
      <pre>
        <code>{JSON.stringify(users, null, 2)}</code>
      </pre>
    </div>
  );
}
