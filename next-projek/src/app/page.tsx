'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to feed page
    router.push('/feed')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-black">
          <Image 
            src="/favicon.png" 
            alt="Somnia Social Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Somnia Social</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}