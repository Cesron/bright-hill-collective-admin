import { HomeHeader } from "./_components/home-header"

import { StatCard } from "@/components/stat-card"

export default function Home() {
  return (
    <>
      <HomeHeader />

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
    </>
  )
}
