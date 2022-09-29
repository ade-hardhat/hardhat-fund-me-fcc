// hardhat looks for this configuration file. This is the entry point for any task that we run that start with hardhat

require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config() // .config() to enable the configuration
require("@nomiclabs/hardhat-etherscan") // plugin for etherscan
require("./tasks/block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const API_KEY = process.env.API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5, //each EVM compatible network has their own chainID, for goerli the chainId is 5
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            // accounts: hardhat default
            chainId: 31337, //hardhat
        },
    },
    // solidity: "0.8.7",
    solidity: {
        compilers: [{ version: "0.8.7" }, { version: "0.6.3" }],
    },
    etherscan: {
        apiKey: API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        // coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}
