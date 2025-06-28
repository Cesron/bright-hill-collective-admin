import { useState } from "react"
import { useForm } from "react-hook-form"

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

  function onSubmit(data: LoginValues) {
    console.log("Form submitted with data:", data)
  }

  return { form, onSubmit, isVisible, toggleVisibility }
}
