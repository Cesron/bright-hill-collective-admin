import Image from "next/image"

import { cn } from "@/lib/cn"

type StatCardProps = {
  type: "students" | "completed" | "pending" | "overdue"
  count: number
  label: string
  icon: string
}

export const StatCard = ({ count = 0, label, icon, type }: StatCardProps) => {
  return (
    <div className="glass relative overflow-hidden rounded-xl p-6">
      <div className="flex items-center gap-4">
        <Image
          src={icon}
          height={32}
          width={32}
          alt="admin-icon"
          className={cn("stat-icon size-8 w-fit", {
            "yellow-glow": type === "students",
            "green-glow": type === "completed",
            "blue-glow": type === "pending",
            "red-glow": type === "overdue",
          })}
        />
        <h2 className="text-3xl font-bold text-white">{count}</h2>
      </div>

      <p className="mt-6">{label}</p>

      <span
        className={cn(
          "pointer-events-none absolute bottom-0 left-6 z-0 block h-[60px] w-[120px] translate-y-1/2 rounded-t-[120px] rounded-b-none opacity-20 blur-3xl",
          {
            "bg-yellow-300": type === "students",
            "bg-green-300": type === "completed",
            "bg-blue-300": type === "pending",
            "bg-red-300": type === "overdue",
          },
        )}
      />
    </div>
  )
}
