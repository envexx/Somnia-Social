import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/lib/providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Somnia Social - Web3 Social Platform',
  description: 'A decentralized social media platform built on Somnia Network with gasless transactions',
  icons: {
    icon: '/next.svg',
    shortcut: '/next.svg',
    apple: '/next.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Web3Provider>
            <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #0000FF, #4485F3, #1e3a8a)'}}>
              {children}
            </div>
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  )
}