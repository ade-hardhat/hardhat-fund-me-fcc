// import
//main function
//calling of main function

// async function deployfunc() {
//     console.log("hi")
// }
// module.exports.default = deployfunc

const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { verify } = require("../utilis/verify")
const { network } = require("hardhat")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const { chainId } = network.config

    //if chainId is X use address Y
    // if chainId is z use address Z
    // to enable this functionality, we take a page from from /aave-V3-core github -> helper-hardhat-config.ts
    // well what happens when we want to change chains?

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUsdPriceFeedAddress

    // console.log(networkConfig[chainId]["ethUsdPriceFeed"])

    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator") //to get the latest deployment
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    // when going for localhost or hardhat network we wnat to use a mock

    // Mock- if the conntract doesn't exist, we deploy a minimal version of our local testing
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put price feed address
        log: true, // this is custom logging, we don't have to do it manually anymore.
        waitConfirmations: network.config.blockConfrimations || 1,
    })
    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("-----------------------------------------")
}

module.exports.tags = ["all", "fundme"]
