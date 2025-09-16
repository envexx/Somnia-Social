import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Import only what we need for the API route
const CONTRACT_ADDRESSES = {
  BatchRelayer: '0xC7cFc7a96150816176C44F0CcD1066a781CEEB82',
}

const BATCH_RELAYER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct BatchRelayer.Call[]",
        "name": "calls",
        "type": "tuple[]"
      },
      {
        "internalType": "uint256",
        "name": "userNonce",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "userSig",
        "type": "bytes"
      }
    ],
    "name": "relayBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "nonce",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sponsor",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "allowedTargets",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Interface untuk request body
interface RelayBatchRequest {
  user: string
  calls: Array<{
    target: string
    value: number
    data: string
  }>
  nonce: number
  deadline: number
  signature: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Relay Batch API Called ===')
    
    // Parse request body
    const body: RelayBatchRequest = await request.json()
    const { user, calls, nonce, deadline, signature } = body

          console.log('=== API Relay Batch Debug ===')
          console.log('Received relay batch request:', {
            user,
            callCount: calls.length,
            nonce,
            deadline,
            signatureLength: signature.length
          })
          console.log('Calls details:', calls)
          console.log('Current timestamp:', Math.floor(Date.now() / 1000))
          console.log('Deadline check:', deadline > Math.floor(Date.now() / 1000))
          console.log('User address for gasless transaction:', user)

    // Validasi input
    if (!user || !calls || !signature) {
      console.error('Missing required fields:', { user: !!user, calls: !!calls, signature: !!signature })
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validasi deadline
    const currentTime = Math.floor(Date.now() / 1000)
    if (deadline <= currentTime) {
      console.error('Deadline expired:', { deadline, currentTime })
      return NextResponse.json(
        { success: false, error: 'Batch execution deadline has passed' },
        { status: 400 }
      )
    }

    // Validasi sponsor wallet configuration
    const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY
    console.log('Sponsor private key configured:', !!sponsorPrivateKey)
    
    if (!sponsorPrivateKey) {
      console.error('SPONSOR_PRIVATE_KEY not configured')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sponsor service not configured. Please set SPONSOR_PRIVATE_KEY in .env.local' 
        },
        { status: 500 }
      )
    }

    // Validasi format private key
    if (!sponsorPrivateKey.startsWith('0x') || sponsorPrivateKey.length !== 66) {
      console.error('Invalid private key format:', sponsorPrivateKey.substring(0, 10) + '...')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid sponsor private key format. Must be 64 hex characters with 0x prefix' 
        },
        { status: 500 }
      )
    }

    // Setup sponsor wallet dan provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network'
    )
    
    let sponsorWallet: ethers.Wallet
    try {
      sponsorWallet = new ethers.Wallet(sponsorPrivateKey, provider)
      console.log('Sponsor wallet created successfully:', sponsorWallet.address)
    } catch (walletError) {
      console.error('Error creating sponsor wallet:', walletError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create sponsor wallet. Check private key format.' 
        },
        { status: 500 }
      )
    }

    // Check sponsor wallet balance
    let balance: bigint
    try {
      balance = await provider.getBalance(sponsorWallet.address)
      const balanceEth = ethers.formatEther(balance)
      console.log('Sponsor wallet balance:', balanceEth, 'ETH')
    } catch (balanceError) {
      console.error('Error checking sponsor wallet balance:', balanceError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check sponsor wallet balance. Check RPC connection.' 
        },
        { status: 500 }
      )
    }

    if (balance === BigInt(0)) {
      console.error('Sponsor wallet has no ETH')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sponsor wallet has no ETH for gas. Please fund the wallet with Somnia testnet ETH.' 
        },
        { status: 500 }
      )
    }

    // Create BatchRelayer contract instance
    const batchRelayer = new ethers.Contract(
      CONTRACT_ADDRESSES.BatchRelayer,
      BATCH_RELAYER_ABI,
      sponsorWallet
    )

    // Verify that sponsor is authorized
    const authorizedSponsor = await batchRelayer.sponsor()
    if (authorizedSponsor.toLowerCase() !== sponsorWallet.address.toLowerCase()) {
      console.error('Sponsor wallet not authorized:', {
        expected: authorizedSponsor,
        actual: sponsorWallet.address
      })
      return NextResponse.json(
        { success: false, error: 'Sponsor wallet not authorized' },
        { status: 403 }
      )
    }

    // Validate that all target contracts are allowed
    for (const call of calls) {
      const isAllowed = await batchRelayer.allowedTargets(call.target)
      if (!isAllowed) {
        console.error('Target contract not allowed:', call.target)
        return NextResponse.json(
          { success: false, error: `Target contract ${call.target} not allowed` },
          { status: 400 }
        )
      }
    }

    // Estimate gas untuk relayBatch
    try {
      const gasEstimate = await batchRelayer.relayBatch.estimateGas(
        user,
        calls,
        nonce,
        deadline,
        signature
      )
      console.log('Estimated gas:', gasEstimate.toString())
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError)
      return NextResponse.json(
        { success: false, error: 'Gas estimation failed - transaction would revert' },
        { status: 400 }
      )
    }

    // Check current nonce for user
    const currentNonce = await batchRelayer.nonce(user)
    console.log('Current nonce for user:', currentNonce.toString())
    console.log('Provided nonce:', nonce)
    console.log('Nonce match:', currentNonce.toString() === nonce.toString())

    // Execute relayBatch transaction (sponsor membayar gas)
    console.log('Executing relayBatch transaction...')
    const tx = await batchRelayer.relayBatch(
      user,
      calls,
      nonce,
      deadline,
      signature,
      {
        gasLimit: 5000000, // Set gas limit yang lebih tinggi untuk batch transaction
      }
    )

    console.log('Transaction submitted:', tx.hash)

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    console.log('Transaction confirmed:', {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    })

    // Check if transaction was successful
    if (receipt.status === 1) {
      console.log('Batch executed successfully')
      return NextResponse.json({
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      })
    } else {
      console.error('Transaction failed')
      return NextResponse.json(
        { success: false, error: 'Transaction failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in relay-batch API:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        return NextResponse.json(
          { success: false, error: 'Sponsor wallet has insufficient funds' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('nonce')) {
        return NextResponse.json(
          { success: false, error: 'Invalid nonce - transaction may have been executed already' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('deadline')) {
        return NextResponse.json(
          { success: false, error: 'Transaction deadline has passed' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('signature')) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY
    if (!sponsorPrivateKey) {
      return NextResponse.json(
        { status: 'error', message: 'Sponsor service not configured' },
        { status: 500 }
      )
    }

    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network'
    )
    
    const sponsorWallet = new ethers.Wallet(sponsorPrivateKey, provider)
    const balance = await provider.getBalance(sponsorWallet.address)
    const balanceEth = ethers.formatEther(balance)

    const batchRelayer = new ethers.Contract(
      CONTRACT_ADDRESSES.BatchRelayer,
      BATCH_RELAYER_ABI,
      provider
    )

    const authorizedSponsor = await batchRelayer.sponsor()

    return NextResponse.json({
      status: 'healthy',
      sponsorAddress: sponsorWallet.address,
      authorizedSponsor,
      balance: balanceEth,
      isAuthorized: authorizedSponsor.toLowerCase() === sponsorWallet.address.toLowerCase()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    )
  }
}
