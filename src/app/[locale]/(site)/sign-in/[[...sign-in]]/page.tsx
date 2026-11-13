import { SignIn } from "@clerk/nextjs";
import { Cloth } from "~/components/table/Cloth";

// Only paths on this site, so a link can't send people elsewhere after
// signing in.
const safeRedirect = (value: string | string[] | undefined) => {
  const url = Array.isArray(value) ? value[0] : value;
  return url?.startsWith("/") && !url.startsWith("//") ? url : undefined;
};

/**
 * Sign in, or create an account. ?redirect_url= (e.g. the sign-up's /start
 * page) is where people go afterwards; otherwise their dashboard. Hash
 * routing keeps that address while they move between signing in and up
 * (path routing would drop it and send them home).
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const target = safeRedirect((await searchParams).redirect_url);
  return (
    // Sign in sits on a plate, on the cloth (the navbar and footer come from
    // the layout). The plate's rim is drawn like the photo plates'.
    <Cloth as="div" className="flex min-h-[70svh] items-start justify-center px-4 py-10 sm:py-16">
      <div className="bg-plate text-ink flex w-full max-w-md justify-center rounded-[2rem] px-2 py-8 shadow-[inset_0_0_0_10px_var(--table-plate-rim),inset_0_0_0_11px_var(--table-plate-rim-shadow),0_18px_40px_rgb(20_4_8/0.4)] sm:px-6 sm:py-10">
        <SignIn
          routing="hash"
          withSignUp
          forceRedirectUrl={target}
          signUpForceRedirectUrl={target}
          fallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        />
      </div>
    </Cloth>
  );
}
