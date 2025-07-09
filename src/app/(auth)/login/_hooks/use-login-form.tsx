import { useState } from "react"
import { useForm } from "react-hook-form"

import { loginAction } from "../_lib/login-action"
import { loginSchema, LoginValues } from "../_lib/login-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

export function useLoginForm() {
  const [loading, setLoading] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  function toggleVisibility() {
    setIsVisible((prev) => !prev)
  }

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginValues) {
    setLoading(true)

    const response = await loginAction(data)

    if (response.serverError) {
      toast.error(response.serverError)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return { form, onSubmit, isVisible, toggleVisibility, loading }
}
