import TonWeb from "tonweb";

import dotenv from "dotenv";

import { initWallet } from "./lib";

const { JettonWallet } = TonWeb.token.jetton;

const jettonWalletAddress = "kQBnLQClf4K3xBml_4v8c2Yd9-5wEcLVfnt8P4vjO145h04P";

dotenv.config();
const mnemonic = process.env.MNEMONIC?.split(" ");
if (!mnemonic) throw new Error("MNEMONIC env variable is required");

const transferJetton = async (to: string, amount: number) => {
  const { secretKey } = await initWallet();

  const tonweb = new TonWeb(
    new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC")
  );

  const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSecretKey(secretKey);

  const WalletClass = tonweb.wallet.all["v4R2"];

  const wallet = new WalletClass(tonweb.provider, {
    publicKey: keyPair.publicKey,
  });

  const seqno = (await wallet.methods.seqno().call()) || 0;

  const comment = new Uint8Array([
    ...new Uint8Array(4),
    ...new TextEncoder().encode("gift"),
  ]);

  const jettonWallet = new JettonWallet(tonweb.provider, {
    address: jettonWalletAddress,
  });

  console.log(
    await wallet.methods
      .transfer({
        sendMode: 1,
        secretKey: keyPair.secretKey,
        toAddress: jettonWalletAddress,
        amount: TonWeb.utils.toNano("0.1"),
        seqno: seqno,
        payload: await jettonWallet.createTransferBody({
          toAddress: new TonWeb.utils.Address(to),
          tokenAmount: TonWeb.utils.toNano("500"),
          forwardAmount: TonWeb.utils.toNano("0.0005"),
          forwardPayload: comment,
          responseAddress: new TonWeb.utils.Address(to),
        }),
      })
      .send()
  );
};

(async () => {
  console.log("Sending jetton...");
  await transferJetton("0QBt8J4HItTLQ4fU5uPkmzHkUoBThsJVEfInMzn21Ukxkpmy", 10);
  console.log("Jetton sent!");
})();
