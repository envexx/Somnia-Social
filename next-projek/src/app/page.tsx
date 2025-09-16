'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to feed page
    router.push('/feed')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
          <img 
            src="/favicon.png" 
            alt="Somnia Social Logo"
            className="w-8 h-8"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Somnia Social</h1>
        <p className="text-gray-600">Redirecting to feed...</p>
      </div>
    </div>
  )
}