require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      forking: {
        url: "https://endpoints.omniatech.io/v1/eth/mainnet/public",
      },
    },
    mainnet: {
      url: "https://endpoints.omniatech.io/v1/eth/mainnet/public",
      accounts: [process.env.PRIVATE_KEY],
    }
  },
};