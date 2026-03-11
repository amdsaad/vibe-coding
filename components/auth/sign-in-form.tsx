"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import Link from "next/link";

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, null);
  const searchParams = useSearchParams();
  const confirmationError = searchParams.get("error") === "confirmation_failed";

  return (
    <form action={action} className="space-y-4">
      {confirmationError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm font-mono text-red-500">
            Email confirmation failed or link expired. Please try signing up again.
          </p>
        </div>
      )}

      {state?.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm font-mono text-red-500">{state.error}</p>
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
          placeholder="Your password"
          required
          autoComplete="current-password"
        />
      </FormField>

      <Button type="submit" loading={pending} className="w-full">
        SIGN IN
      </Button>

      <p className="text-center text-sm font-mono text-gray">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-foreground underline underline-offset-4 hover:text-red"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
