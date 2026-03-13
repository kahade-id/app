"use client"

import * as React from "react"
import { useForm, type ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeSlash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useChangePassword } from "@/lib/hooks/use-auth"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth.schema"

// #6 FIX: Gunakan ControllerRenderProps dengan generic yang benar, bukan
// Record<string, unknown> yang mem-bypass type checking TypeScript.
type PasswordInputProps = {
  field: ControllerRenderProps<ChangePasswordInput, 'currentPassword' | 'newPassword' | 'confirmPassword'>
  placeholder?: string
}

function PasswordInput({ field, ...props }: PasswordInputProps) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} {...field} {...props} className="pr-10" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShow(!show)}
        tabIndex={-1}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show ? <EyeSlash className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
      </Button>
    </div>
  )
}

export function ChangePasswordForm() {
  const changePassword = useChangePassword()

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "", revokeOtherSessions: true },
  })

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Ubah Password</CardTitle>
        <CardDescription>Pastikan password baru Anda kuat dan unik</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => changePassword.mutate(data, { onSuccess: () => form.reset() }))} className="space-y-5">
            <FormField control={form.control} name="currentPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Password Saat Ini</FormLabel>
                <FormControl><PasswordInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="newPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Password Baru</FormLabel>
                <FormControl><PasswordInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Password Baru</FormLabel>
                <FormControl><PasswordInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="pt-1">
              <Button type="submit" disabled={changePassword.isPending} data-testid="button-submit-change-password">
                {changePassword.isPending ? "Menyimpan..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export { PasswordInput }
