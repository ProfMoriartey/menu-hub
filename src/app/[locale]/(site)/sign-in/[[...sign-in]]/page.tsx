import { SignIn } from "@clerk/nextjs";

// Only paths on this site, so a link can't send people elsewhere after
// signing in.
const safeRedirect = (value: string | string[] | undefined) => {
  const url = Array.isArray(value) ? value[0] : value;
  return url?.startsWith("/") && !url.startsWith("//") ? url : undefined;
};

/**
 * Sign in, or create an account. ?redirect_url= (e.g. the sign-up's /start
 * page) is where people go afterwards.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const target = safeRedirect((await searchParams).redirect_url);
  return (
    <div className="bg-background flex min-h-screen items-start justify-center p-4 pt-[15vh]">
      <SignIn withSignUp forceRedirectUrl={target} signUpForceRedirectUrl={target} />
    </div>
  );
}
