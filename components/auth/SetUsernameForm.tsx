"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SpinnerGap } from "@phosphor-icons/react"
import { setUsernameSchema, type SetUsernameInput } from "@/lib/validations/auth.schema"
import { useSetUsername, useLogout } from "@/lib/hooks/use-auth"
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
  // AUTH-06 FIX: User is already authenticated at this step (they just logged in).
  // A "Back to Login" link → /login → middleware detects valid token → redirects to app.
  // The correct escape hatch is to logout, which clears the session properly.
  const logoutMutation = useLogout()

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

        {/* AUTH-06 FIX: Replace "Kembali ke Login" link with a logout button.
            User is already authenticated — navigating to /login triggers a middleware
            redirect back to the app, creating a confusing redirect loop.
            The correct action is to logout, clearing the session entirely. */}
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-cancel-username"
          >
            {logoutMutation.isPending ? "Keluar..." : "Batalkan & Keluar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
