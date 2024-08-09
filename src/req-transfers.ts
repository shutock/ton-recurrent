import { WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { tonClient } from "./lib";

const updateTime = new Date();

const mnemonic = process.env.MNEMONIC?.split(" ");
if (!mnemonic) throw new Error("MNEMONIC env variable is required");

const value = "0.01337";
const to = "0QBt8J4HItTLQ4fU5uPkmzHkUoBThsJVEfInMzn21Ukxkpmy";
const updateInterval = 1000 * 60 * 60 * 24;
updateTime.setUTCHours(12, 0, 0, 0);

const bottleneck = () =>
  new Promise((resolve) =>
    setTimeout(resolve, tonClient.parameters.apiKey ? 0 : 3000)
  );

const printStatus = (status: string, balance: bigint) => {
  console.clear();
  console.log(`\r${status}`);
  console.log(`Balance: ${Number(balance) / 10e8}\n`);
};

export const run = async () => {
  try {
    const { publicKey, secretKey } = await mnemonicToPrivateKey(mnemonic);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey });
    const contract = tonClient.open(wallet);

    await bottleneck();
    printStatus("Sending...", await contract.getBalance());

    await bottleneck();
    const seqno = await contract.getSeqno();

    await bottleneck();
    const messages = [internal({ value, to, body: "Lorem ipsum" })];
    const transfer = contract.createTransfer({ seqno, secretKey, messages });
    await contract.send(transfer);

    await bottleneck();
    printStatus("Sent!", await contract.getBalance());

    console.log(`Next run in ${updateInterval / 1000}s`);
    setTimeout(run, updateInterval);
  } catch (error) {
    console.error(error);
  }
};

const timeToFirstRun = updateTime.getTime() - Date.now();
console.log(`Time to first run: ${Math.floor(timeToFirstRun / 1000)}s\n`);

setTimeout(run, timeToFirstRun);
