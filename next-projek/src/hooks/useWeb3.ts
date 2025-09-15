'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function useWeb3() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return {
    address,
    isConnected,
    connect,
    disconnect,
    connectors,
  }
}

export { ConnectButton }
