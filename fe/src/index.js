import Web3 from "web3";
import { encryptData, decryptData, download } from "./lib";

import { getEncryptionPublicKey, personalSign } from "@metamask/eth-sig-util";

import jsonObject from "./contracts/contract_addresses.json";
import accounts from "./prvKeys.json";

let wallet;
let web3 = new Web3("http://localhost:8545");
web3.eth.handleRevert = true;

let NFT = new web3.eth.Contract(jsonObject.NFTABI, jsonObject.NFT_Address);

contractAddress.innerText = jsonObject.NFT_Address;

const initialize = async () => {
  let ownedDocs = await NFT.methods
    .getUserDocuments()
    .call({ from: wallet.address });
  console.log(ownedDocs);
  documents.innerText = ownedDocs;
};

document.getElementById("connectAcc1").onclick = async function () {
  wallet = web3.eth.accounts.wallet.add(accounts.accounts[0]);
  connectedAccount.innerText = wallet.address;
  walletBalance.innerText = await web3.eth.getBalance(wallet.address);
  encryptionKey.innerText = getEncryptionPublicKey(wallet.privateKey.slice(2));
  initialize();
};

document.getElementById("connectAcc2").onclick = async function () {
  wallet = web3.eth.accounts.wallet.add(accounts.accounts[1]);
  connectedAccount.innerText = wallet.address;
  walletBalance.innerText = await web3.eth.getBalance(wallet.address);
  encryptionKey.innerText = getEncryptionPublicKey(wallet.privateKey.slice(2));
  initialize();
};

document.getElementById("connectAcc3").onclick = async function () {
  wallet = web3.eth.accounts.wallet.add(accounts.accounts[2]);
  connectedAccount.innerText = wallet.address;
  walletBalance.innerText = await web3.eth.getBalance(wallet.address);
  encryptionKey.innerText = getEncryptionPublicKey(wallet.privateKey.slice(2));
  initialize();
};

document
  .getElementById("inputfile")
  .addEventListener("change", async function (e) {
    let fr = new FileReader();

    fr.onload = async (e) => {
      await encodeData(e.target.result);
    };
    fr.readAsDataURL(e.target.files[0]);
  });

const encodeData = async (fileContent) => {
  console.log(`fileContent: ${fileContent}`);
  let encryptedDoc = encryptData(fileContent, encryptionKey.innerText);

  console.log(`encryptedDoc: ${JSON.stringify(encryptedDoc)}`);

  // mint NFT doc
  let { transactionHash } = await NFT.methods
    .mint(JSON.stringify(encryptedDoc), 0)
    .send({
      from: wallet.address,
      gasLimit: 1_000_000_000_000,
    });

  actionMint.style.color = "green";
  actionMint.innerText = "success";
  tx.innerText = transactionHash;
};

// decrypt data
document.getElementById("retrieveAndDecrypt").onclick = async function () {
  let nftInfo;
  let nft;

  let owner = await NFT.methods.ownerOf(retrieveDocID.value).call();

  if (owner != wallet.address) {
    console.log("Querer is not owner");
    nftInfo = await NFT.methods
      .signerToDocumentVerifyMapping(wallet.address, retrieveDocID.value)
      .call();

    nft = nftInfo;

    if (nftInfo == "0x0") {
      actionRetrieve.style.color = "orange";
      actionRetrieve.innerText = "Document wiped out";
      return;
    }
  } else {
    nftInfo = await NFT.methods.tokenMetadata(retrieveDocID.value).call();

    nft = nftInfo.encryptedFile;
  }

  console.log(nft);

  let decryptedDoc = decryptData(JSON.parse(nft), wallet);

  // decode
  actionRetrieve.style.color = "green";
  actionRetrieve.innerText = "success";
  a.style.display = "";

  download(decryptedDoc, `decodedDocument_ID${retrieveDocID.value}`);
};

document.getElementById("requestSignature").onclick = async function () {
  console.log(signerAddress.value);

  let nftInfo = await NFT.methods
    .tokenMetadata(signDocumentId.value)
    .call({ from: wallet.address });

  let decryptedDoc2 = decryptData(JSON.parse(nftInfo.encryptedFile), wallet);

  // we decrypt doc to decrypt it with signer encryptionKey
  let encryptedDocDecrypted = encryptData(
    decryptedDoc2,
    signerEncryptionKey.value
  );

  console.log(`encryptedDocDecrypted: ${encryptedDocDecrypted}`);

  let { transactionHash } = await NFT.methods
    .addSigner(
      signDocumentId.value,
      signerAddress.value,
      JSON.stringify(encryptedDocDecrypted)
    )
    .send({
      from: wallet.address,
      gasLimit: 1_000_000_000_000,
    });

  console.log(transactionHash);

  transactionStatus.innerText = transactionHash;
};

// request signing of doc (by owner)
document.getElementById("signDocument").onclick = async function () {
  console.log(documentId.value);

  let hashedMessage = await NFT.methods.getMessageHash(documentId.value).call();

  console.log(hashedMessage);

  Signature.innerText = personalSign({
    data: hashedMessage,
    privateKey: wallet.privateKey.slice(2),
  });

  let sig = Signature.innerText;

  let { transactionHash } = await NFT.methods
    .signDocument(documentId.value, sig)
    .send({
      from: wallet.address,
      gasLimit: 1_000_000_000_000,
    });

  console.log(transactionHash);

  transactionStatus2.innerText = hashedMessage;
};

document.getElementById("verifySign").onclick = async function () {
  let transactionHash = await NFT.methods
    .verifySigningOfDocument(signedDocumentId.value, addressOfSigner.value)
    .call();

  recoveredSig.innerText = transactionHash;
};
