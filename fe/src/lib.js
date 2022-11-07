import { encrypt, decrypt } from "@metamask/eth-sig-util";

async function connectWallet() {
  return await ethereum.request({ method: "eth_requestAccounts" });
}

function encryptData(content, encryptionKey) {
  let encrypted;
  try {
    encrypted = encrypt({
      publicKey: encryptionKey,
      data: content,
      version: "x25519-xsalsa20-poly1305",
    });
    console.log(`Encrypted value: ${encrypted}`);
    return encrypted;
  } catch (error) {
    actionMint.style.color = "red";
    actionMint.innerText = `Error: ${error.message}`;
  }
}

function decryptData(encryptedData, wallet) {
  let decrypted;

  try {
    decrypted = decrypt({
      encryptedData: encryptedData,
      privateKey: wallet.privateKey.slice(2),
      version: "x25519-xsalsa20-poly1305",
    });
    console.log(`Decrypted value: ${decrypted}`);
    return decrypted;
  } catch (error) {
    actionRetrieve.style.color = "red";
    actionRetrieve.innerText = `Error: ${error.message}`;
  }
}

function download(text, name) {
  const data = base64ToArrayBuffer(text.split(",")[1]);
  var a = document.getElementById("a");
  const file = new Blob([data], { type: "application/pdf" });
  a.href = URL.createObjectURL(file);
  a.download = name;
}

const base64ToArrayBuffer = (base64) => {
  var binaryString = window.atob(base64);
  var binaryLen = binaryString.length;
  var bytes = new Uint8Array(binaryLen);
  for (var i = 0; i < binaryLen; i++) {
    var ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes;
};

export { connectWallet, encryptData, decryptData, download };
