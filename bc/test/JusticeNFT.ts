import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, config } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { NFT } from "../typechain-types/contracts/JusticeNFT";
import { NFT__factory } from "../typechain-types/factories/contracts/JusticeNFT__factory";

import { readFileSync } from "fs";

import {
  getEncryptionPublicKey,
  encrypt,
  decrypt,
  // recoverTypedSignature_v4,
} from "@metamask/eth-sig-util";

describe("NFT", function () {
  let NFT: NFT;
  let deployer: SignerWithAddress;
  let lawyer: SignerWithAddress;
  let client: SignerWithAddress;

  // let accounts = [
  //   "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
  //   "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
  //   "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
  // ];

  async function deploy() {
    // deployer = new ethers.Wallet(accounts[0]);
    // lawyer = new ethers.Wallet(accounts[1]);
    // client = new ethers.Wallet(accounts[2]);
    [deployer, lawyer, client] = await ethers.getSigners();

    // justiceNFT = await new JusticeNFT__factory(
    //   deployer.connect(ethers.provider)
    // ).deploy();

    NFT = await new NFT__factory(deployer).deploy();
  }

  describe("NFT Tests", function () {
    it("Should allow to mint NFT", async function () {
      await loadFixture(deploy);

      const accounts = config.networks.hardhat.accounts;
      const index = 0;

      // create wallet object to have access to privateKey (for file encryption)
      const wallet = ethers.Wallet.fromMnemonic(
        accounts.mnemonic,
        accounts.path + `/${index}`
      );

      // let wallet = ethers.Wallet.createRandom();
      //   console.log(wallet.privateKey);

      let file = readFileSync(__dirname + "/test-data/b64_encoded", "utf-8");
      let encryptionKey = getEncryptionPublicKey(wallet.privateKey.slice(2));
      let encryptedFile = encrypt({
        publicKey: encryptionKey,
        data: file,
        version: "x25519-xsalsa20-poly1305",
      });

      await expect(
        NFT.connect(wallet.connect(ethers.provider)).mint(encryptedFile, 0, {
          gasLimit: 1_000_000,
        })
      )
        .to.emit(NFT, "DocumentCreation")
        .withArgs(1, wallet.address);
    });
  });
});
