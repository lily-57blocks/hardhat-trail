const hre = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CurveHelper", function () {
  const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const tcrv = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
  const basePool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
  const userAddr = "0xb57BE4AB4304C5aADc9E5Ea2b0B34f1F04413232";
  let user, usdcBalance, curveHelper, curveHelperAddr, usdcToken, tcrvToken;

  async function deployAndInit() {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [userAddr],
    });
    await hre.network.provider.send("hardhat_setBalance", [
        userAddr,
        "0x56BC75E2D63100000", // 1000 ETH
        ]);
    user = await ethers.provider.getSigner(userAddr);

    usdcToken = await ethers.getContractAt("IERC20", usdc);
    tcrvToken = await ethers.getContractAt("IERC20", tcrv);
    usdcBalance = await usdcToken.balanceOf(userAddr);
    console.log("usdcBalance", usdcBalance.toString());

    curveHelper = await hre.ethers.deployContract("CurveHelper", [
      tcrv,
      usdc,
      basePool,
    ]);
    await curveHelper.waitForDeployment();
    curveHelperAddr = curveHelper.target;
    console.log("CurveHelper deployed to:", curveHelperAddr);

    await usdcToken.connect(user).approve(curveHelperAddr, usdcBalance);
  }

  describe("invest", function () {
    const investAmount = BigInt(1000 * 1e6);

    beforeEach(async function () {
      await loadFixture(deployAndInit);
    });

    it("should work", async function () {
      const tcrvPreBalance = await tcrvToken.balanceOf(userAddr);
      await expect(curveHelper.connect(user).invest(investAmount))
        .to.emit(curveHelper, "Invested")
        .withArgs(userAddr, investAmount, anyValue);
      expect(await tcrvToken.balanceOf(userAddr)).to.be.gt(tcrvPreBalance);
      expect(await usdcToken.balanceOf(userAddr)).to.be.equal(
        usdcBalance - investAmount
      );
    });
  });

  describe("withdraw", function () {
    const investAmount = BigInt(1000 * 1e6);
    let tcrvBalance;
    beforeEach(async function () {
      await loadFixture(deployAndInit);
      await curveHelper.connect(user).invest(investAmount);
      tcrvBalance = await tcrvToken.balanceOf(userAddr);
      await tcrvToken.connect(user).approve(curveHelperAddr, tcrvBalance);
    });

    it("should work", async function () {
      const usdcPreBalance = await usdcToken.balanceOf(userAddr);
      const withdrawAmount = tcrvBalance / BigInt(2);
      await expect(curveHelper.connect(user).withdraw(withdrawAmount))
        .to.emit(curveHelper, "Withdrawn")
        .withArgs(userAddr, withdrawAmount, anyValue);
      expect(await tcrvToken.balanceOf(userAddr)).to.be.equal(
        tcrvBalance - withdrawAmount
      );
      expect(await usdcToken.balanceOf(userAddr)).to.be.gt(usdcPreBalance);
    });
  });
});
