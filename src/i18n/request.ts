import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

// Define the precise structure of your message files.
// You MUST list all top-level keys present in your JSON message files
// along with their specific types.
interface Messages {
  // Example:
  Common: {
    dashboard: string;
    // ... add other keys under Common
  };
  HomePage: {
    title: string;
    description: string;
    // ... add other keys under HomePage
  };
  // Add all other top-level keys from your JSON files
  // For nested objects, define their types as well
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messagesModule = (await import(`../messages/${locale}.json`)) as {
    default: Messages;
  };

  return {
    locale,
    messages: messagesModule.default,
  };
});
