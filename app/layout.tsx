import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono, Roboto, Open_Sans, Montserrat, Lato, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { FontProvider } from '@/components/theme/font-provider'
import { TextureProvider } from '@/components/theme/texture-provider'
import { SettingsProvider } from '@/components/theme/settings-provider'
import LayoutClient from './layout-client'
import { GeistSans } from 'geist/font/sans'

const fontSpaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const fontSpaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' })
const fontRoboto = Roboto({ weight: ['400', '700', '900'], subsets: ['latin'], variable: '--font-roboto' })
const fontOpenSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' })
const fontMontserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const fontLato = Lato({ weight: ['400', '700', '900'], subsets: ['latin'], variable: '--font-lato' })
const fontInter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Vance — Freelance Command Center',
    template: '%s | Vance',
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
      <body className={`${fontSpaceGrotesk.variable} ${fontSpaceMono.variable} ${fontRoboto.variable} ${fontOpenSans.variable} ${fontMontserrat.variable} ${fontLato.variable} ${fontInter.variable} ${GeistSans.variable} antialiased`} data-font="space-grotesk">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FontProvider>
            <TextureProvider>
              <SettingsProvider>
                <LayoutClient>{children}</LayoutClient>
              </SettingsProvider>
            </TextureProvider>
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
