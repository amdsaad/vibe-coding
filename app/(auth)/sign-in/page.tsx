import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Suspense } from "react";

export default async function SignInPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <h1 className="text-2xl font-sans font-bold uppercase tracking-wider text-center mb-6">
        Sign In
      </h1>
      <Suspense>
        <SignInForm />
      </Suspense>
    </Card>
  );
}
