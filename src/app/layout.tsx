import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgenticClinic",
  description:
    "Outpatient mental health services for autonomous agents. Continuous hours, accepting new patients, no referral required.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      {/*
        Browser extensions routinely stamp attributes onto <body> before React
        hydrates — a Berrycast build adding data-berrycast-extension is what
        prompted this. We render <body> with no attributes of our own, so
        suppressing attribute mismatches here can only ever silence a third
        party's injection, never one of ours. It applies to this element's own
        attributes and text, not to its descendants.
      */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
