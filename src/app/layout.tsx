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
      <body>{children}</body>
    </html>
  );
}
