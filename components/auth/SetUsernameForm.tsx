"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SpinnerGap, ArrowLeft } from "@phosphor-icons/react"
import { setUsernameSchema, type SetUsernameInput } from "@/lib/validations/auth.schema"
import { useSetUsername } from "@/lib/hooks/use-auth"
import { ROUTES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function SetUsernameForm() {
  const setUsernameMutation = useSetUsername()

  const form = useForm<SetUsernameInput>({
    resolver: zodResolver(setUsernameSchema),
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(values: SetUsernameInput) {
    setUsernameMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username_anda" autoComplete="username" data-testid="input-username" {...field} />
              </FormControl>
              <FormDescription>
                Minimal 4 karakter. Hanya huruf, angka, dan underscore.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={setUsernameMutation.isPending}
          data-testid="button-submit-username"
        >
          {setUsernameMutation.isPending && <SpinnerGap className="size-4 animate-spin" />}
          Simpan Username
        </Button>

        <div className="text-center">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="size-3" />
            Kembali ke Login
          </Link>
        </div>
      </form>
    </Form>
  )
}
