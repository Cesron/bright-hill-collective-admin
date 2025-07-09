import { StatCard } from "@/components/stat-card"

export default async function Home() {
  return (
    <>
      <header className="bg-header">
        <div className="container mx-auto p-4">
          <h1 className="text-primary-foreground text-xl font-bold">
            Bright Hill Collective Admin
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div>
          <h2 className="text-primary-foreground text-lg font-bold">
            Welcome, Admin
          </h2>
          <p>Start your day with a review of the latest updates.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            type="students"
            count={94}
            label="Total students enrolled"
            icon="/icons/students.svg"
          />

          <StatCard
            type="completed"
            count={42}
            label="Total completed payments"
            icon="/icons/completed.svg"
          />

          <StatCard
            type="pending"
            count={12}
            label="Total pending payments"
            icon="/icons/pending.svg"
          />

          <StatCard
            type="overdue"
            count={5}
            label="Total overdue payments"
            icon="/icons/overdue.svg"
          />
        </div>
      </main>
    </>
  )
}
