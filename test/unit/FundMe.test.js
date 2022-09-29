// const { deployments, ethers, getNamedAccounts } = require("hardhat")
// const { assert, expect } = require("chai")
// const { describe, it } = require("node:test")

const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          // const sendValue = "1000000000000000000" // 1 ETH
          const sendValue = ethers.utils.parseEther("1") // 1 ETH

          beforeEach(async function () {
              // deploy our fundme contract
              // using Hardhat-deploy, it will come with mocks and other deploy scripts
              // const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]
              // const {deployer} = await getNamedAccounts()
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) // fixture() enables us make use out tags, it will come with mocks and other deploy scripts
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
              // console.log(fundMe)
          })
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it(" fails when you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  ) //this test is aided with waffle, which is overrided by chai
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const fund = await fundMe.getFunder(0)
                  assert.equal(fund.toString(), deployer.toString())
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single funder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt

                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingfundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingdeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingfundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingdeployerBalance.add(gasCost).toString()
                  )
              })
              it("allows us to withdraw with multiple funders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (
                      let i = 1;
                      /* i starts from one since index zero is the deployer */ i <
                      6;
                      i++
                  ) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      ) // the connect function connects the contract with the new account
                      await fundMeConnectedContract.fund({ value: sendValue }) // send ETH with the account to the contract
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingfundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingdeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //Assert

                  assert.equal(endingfundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingdeployerBalance.add(gasCost).toString()
                  )

                  //Make sure that the funders are reset properly
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("only allows the owner to withdraw", async function () {
                  const account = await ethers.getSigners()
                  const attackerAccount = account[1]
                  const attackerFundMeAccount = await fundMe.connect(
                      attackerAccount
                  )

                  await expect(
                      attackerFundMeAccount.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
      })
