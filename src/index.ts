import TonWeb from "tonweb";

import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient } from "@ton/ton";

const { JettonWallet } = TonWeb.token.jetton;

const jettonWalletAddress = "kQBnLQClf4K3xBml_4v8c2Yd9-5wEcLVfnt8P4vjO145h04P";
const message = "Lorem";

const data = {
  "0:fc4e88908d24f8e342b56276ef2bf4a4142a5967987569f7a98c12080b195138": 50, // test
  "0QBt8J4HItTLQ4fU5uPkmzHkUoBThsJVEfInMzn21Ukxkpmy": 100, // test
};

const mnemonic = [""];

const endpoints = {
  testnet: "https://testnet.toncenter.com/api/v2/jsonRPC",
  mainnet: "https://toncenter.com/api/v2/jsonRPC",
};

const network: keyof typeof endpoints = "mainnet";

const tonClient = new TonClient({
  endpoint: endpoints[network],
});

const tonweb = new TonWeb(new TonWeb.HttpProvider(endpoints[network]));

const transferJetton = async (to: string, amount: number) => {
  const { secretKey, publicKey } = await mnemonicToPrivateKey(mnemonic);

  const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSecretKey(secretKey);

  const WalletClass = tonweb.wallet.all["v4R2"];

  const wallet = new WalletClass(tonweb.provider, { publicKey });

  const responseAddress = await wallet.getAddress();

  const seqno = (await wallet.methods.seqno().call()) || 0;

  const forwardPayload = new Uint8Array([
    ...new Uint8Array(4),
    ...new TextEncoder().encode(message),
  ]);

  const jettonWallet = new JettonWallet(tonweb.provider, {
    address: jettonWalletAddress,
  });

  console.log(
    await wallet.methods
      .transfer({
        sendMode: 3,
        secretKey: keyPair.secretKey,
        toAddress: jettonWalletAddress,
        amount: TonWeb.utils.toNano("0.1"),
        seqno: seqno,
        payload: await jettonWallet.createTransferBody({
          toAddress: new TonWeb.utils.Address(to),
          // @ts-ignore
          jettonAmount: TonWeb.utils.toNano(amount.toString()),
          forwardAmount: TonWeb.utils.toNano("0.000000001"),
          forwardPayload,
          responseAddress,
        }),
      })
      .send()
  );
};

(async () => {
  console.log(`Starting...\n\n`);

  const array = Object.entries(data);
  let i = 0;

  for (const [to, amount] of array) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await transferJetton(to, amount);
    console.log(`Sent ${i + 1}/${array.length}`);
    i++;
  }

  console.log("\n\nDone!");
})();
