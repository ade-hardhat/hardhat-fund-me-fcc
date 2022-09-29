// const { network } = require("hardhat")
const {
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments, network } = hre
    // console.log(hre)

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const { chainId } = network.config

    if (developmentChain.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed")
        log("-----------------------------------------")
    }
}

// Is there a way to only deploy the deploy-mocks scripts? Yes..

module.exports.tags = ["all", "mocks"]
