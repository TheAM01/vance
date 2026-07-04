import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { SettingsProvider } from '@/components/theme/settings-provider'
import LayoutClient from './layout-client'

const fontDmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Vance — Freelance Command Center',
    template: '%s · Vance',
  },
  description: 'Project, task and revenue management for freelancers.',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontDmSans.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <LayoutClient>{children}</LayoutClient>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
