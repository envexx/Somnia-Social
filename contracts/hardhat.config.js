require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // viaIR: true, // Enable IR-based code generation for better optimization (disabled for compatibility)
    },
  },
  networks: {
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "https://dream-rpc.somnia.network",
      chainId: parseInt(process.env.SOMNIA_CHAIN_ID) || 50312,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: parseInt(process.env.GAS_PRICE) || 20000000000, // 20 gwei
      gas: parseInt(process.env.GAS_LIMIT) || 5000000,
    },
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: 'USD',
    gasPrice: 20, // gwei
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
    outputFile: 'gas-report.txt',
    noColors: true,
  },
  etherscan: {
    apiKey: {
      somnia: process.env.ETHERSCAN_API_KEY || "dummy-key",
    },
    customChains: [
      {
        network: "somnia",
        chainId: 50312,
        urls: {
          apiURL: "https://somnia-testnet.socialscan.io/api",
          browserURL: "https://somnia-testnet.socialscan.io"
        }
      }
    ]
  },
  mocha: {
    timeout: 40000, // 40 seconds timeout for tests
  },
};