const { run } = require("hardhat")
async function verify(contractAddress, args) {
    // args for when we have constructors
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        }) // verify is a parameter that we pass, check yarn hardhat verify --help
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified")
        } else console.log(error)
    }
}

module.exports = { verify }
