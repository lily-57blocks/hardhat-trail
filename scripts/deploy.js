// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const tcrv = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
  const basePool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";

  const curveHelper = await hre.ethers.deployContract("CurveHelper", [
    tcrv,
    usdc,
    basePool,
  ]);
  await curveHelper.waitForDeployment();
  const curveHelperAddr = curveHelper.target;
  console.log("CurveHelper deployed to:", curveHelperAddr);

  const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
    value: lockedAmount,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
