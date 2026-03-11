"use client";

import { useActionState } from "react";
import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import Link from "next/link";

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm font-mono text-red-500">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3">
          <p className="text-sm font-mono text-teal-600">{state.success}</p>
        </div>
      )}

      <FormField label="EMAIL">
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </FormField>

      <FormField label="PASSWORD">
        <Input
          name="password"
          type="password"
          placeholder="Min 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </FormField>

      <Button type="submit" loading={pending} className="w-full">
        CREATE ACCOUNT
      </Button>

      <p className="text-center text-sm font-mono text-gray">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-foreground underline underline-offset-4 hover:text-red"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
