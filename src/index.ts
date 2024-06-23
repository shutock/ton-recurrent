import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";

const updateTime = new Date();

// ! FILL THIS ↓
const mnemonics = ["word1", "word2", "...", "word23", "word24"]; // 24 words
const value = "0.01337"; // amount in TON
const to = "UQ..."; // recipient address
const updateInterval = 1000 * 60 * 60 * 24; // 24 hours
updateTime.setUTCHours(12, 0, 0, 0); // send time in UTC
// ! FILL THIS ↑

const client = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
});

// bottleneck to avoid rate limits (officially 1 req per second, but in practice 1 req per 3 seconds)
const bottleneck = () =>
  new Promise((resolve) =>
    setTimeout(resolve, client.parameters.apiKey ? 0 : 3000)
  );

const printStatus = (status: string, balance: bigint) => {
  console.clear();
  console.log(`\r${status}`);
  console.log(`Balance: ${Number(balance) / 10e8}\n`);
};

const run = async () => {
  try {
    // init wallet from mnemonics
    const { publicKey, secretKey } = await mnemonicToPrivateKey(mnemonics);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey });
    const contract = client.open(wallet);

    // get balance
    await bottleneck();
    printStatus("Sending...", await contract.getBalance());

    // get sequence number for the next transfer (necessary for ton)
    await bottleneck();
    const seqno = await contract.getSeqno();

    // transfer tokens
    await bottleneck();
    const messages = [internal({ value, to, body: "Lorem ipsum" })];
    await contract.sendTransfer({ seqno, secretKey, messages });

    // get balance
    await bottleneck();
    printStatus("Sent!", await contract.getBalance());

    // schedule next run
    console.log(`Next run in ${updateInterval / 1000}s`);
    setTimeout(run, updateInterval);
  } catch (error) {
    console.error(error);
  }
};

const timeToFirstRun = updateTime.getTime() - Date.now();
console.log(`Time to first run: ${Math.floor(timeToFirstRun / 1000)}s\n`);

setTimeout(run, timeToFirstRun);
