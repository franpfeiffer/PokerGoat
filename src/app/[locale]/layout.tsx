import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { playfairDisplay, dmSans } from "@/styles/fonts";
import { AuthProvider } from "@/components/providers/auth-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "PokerGoat",
    template: "%s | PokerGoat",
  },
  description:
    "Lleva el control de tus noches de poker con amigos. Clasificaciones, estad\u00edsticas y m\u00e1s.",
  applicationName: "PokerGoat",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PokerGoat",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <div
      className={`${playfairDisplay.variable} ${dmSans.variable} bg-background text-foreground antialiased`}
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
