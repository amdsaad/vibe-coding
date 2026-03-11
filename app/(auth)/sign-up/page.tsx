import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default async function SignUpPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <h1 className="text-2xl font-sans font-bold uppercase tracking-wider text-center mb-6">
        Create Account
      </h1>
      <SignUpForm />
    </Card>
  );
}
