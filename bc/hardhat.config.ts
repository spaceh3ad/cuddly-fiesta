import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-abi-exporter";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "localhost",
  networks: {
    // hardhat: {
    //   blockGasLimit: 1_000_000_000,
    // },
    localhost: {
      url: "http://localhost:8545",
      // gas: 1_000_000_000,
      blockGasLimit: 1_000_000_000,

      accounts: [
        "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
        "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
        "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
      ],
    },
  },
  abiExporter: {
    path: "../fe/src/contracts",
    runOnCompile: true,
    only: ["JusticeNFT"],
    spacing: 2,
    // pretty: true,
    // format: "minimal",
  },
};

export default config;
