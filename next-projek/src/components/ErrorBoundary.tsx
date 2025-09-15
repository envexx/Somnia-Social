'use client'

import { useEffect } from 'react'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress Coinbase wallet errors in development
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      if (
        message.includes('cca-lite.coinbase.com') ||
        message.includes('as.coinbase.com') ||
        message.includes('Analytics SDK') ||
        message.includes('ERR_CERT_COMMON_NAME_INVALID') ||
        message.includes('ERR_CONNECTION_RESET')
      ) {
        // Suppress these specific errors
        return
      }
      originalConsoleError.apply(console, args)
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [])

  return <>{children}</>
}
