import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Spendesk Reviews Analytics",
  description: "Capterra reviews analysis for Spendesk",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
