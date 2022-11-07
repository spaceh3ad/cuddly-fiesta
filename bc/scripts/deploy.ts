import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

import { NFT, NFT__factory } from "../typechain-types";

async function main() {
  let nft: NFT;
  // let verifySig: VerifySignature;

  const [deployer] = await ethers.getSigners();

  nft = await new NFT__factory(deployer).deploy();
  console.log(`NFT at: ${nft.address}`);
  writeToFile({ contract: nft.address });
}

function writeToFile(contracts: Object) {
  let prettyJson = JSON.stringify(contracts, null, 2);
  fs.writeFileSync(
    path.join(
      __dirname,
      "..",
      "..",
      "/fe/src/contracts/contract_addresses.json"
    ),
    prettyJson,
    {
      encoding: null,
    }
  );
  console.log(prettyJson);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
