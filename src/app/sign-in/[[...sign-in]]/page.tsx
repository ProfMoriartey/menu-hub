import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 p-4 pt-[25vh]">
      <SignIn />
    </div>
  );
}
