import { SignupForm } from "@/components/signup-form";
import { Spotlight } from "@/components/ui/Spotlight";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Signup() {
  return (
    <main className="bg-background">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#FB6107"
      />
      <div className="absolute top-6 md:top-10 left-6 md:left-10 flex justify-center gap-2 md:justify-start z-10">
        <Link href="/" className="flex items-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md text-primary">
            <ArrowLeft className="size-4" />
          </div>
          back
        </Link>
      </div>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <Image
            src="/logo-transparent.png"
            alt="Image"
            width="412"
            height="412"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2]"
          />
        </div>
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs z-10">
              <SignupForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
