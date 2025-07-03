import { CustomError } from "@/helpers/custom-error"
import { createSafeActionClient } from "next-safe-action"

const DEFAULT_ERROR_MESSAGE =
  "An unexpected error occurred. Please try again later."

export const actionClient = createSafeActionClient({
  async handleServerError(e) {
    if (e instanceof CustomError) {
      return e.message
    }

    console.error("Server error:", e)

    return DEFAULT_ERROR_MESSAGE
  },
})
