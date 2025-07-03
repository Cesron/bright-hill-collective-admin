import { useState } from "react"
import { useForm } from "react-hook-form"

import { loginAction } from "../_lib/login-action"
import { loginSchema, LoginValues } from "../_lib/login-schema"
import { zodResolver } from "@hookform/resolvers/zod"

export function useLoginForm() {
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
    await loginAction(data)
  }

  return { form, onSubmit, isVisible, toggleVisibility }
}
