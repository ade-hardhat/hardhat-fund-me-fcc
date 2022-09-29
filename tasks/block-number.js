const { task } = require("hardhat/config") //hardhat/config has the task function in it

task("block-number", "Prints the current block number").setAction(
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber()
        console.log(`Current block number : ${blockNumber}`)
    } // taskArgs is vacant is this case, however hre is hardhat runtime environment similarly to require("hardhat")
) //name, description

module.exports = {}
