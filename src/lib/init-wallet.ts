import dotenv from "dotenv";
import { WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { tonClient } from "./ton-client";

dotenv.config();
const mnemonic = process.env.MNEMONIC?.split(" ");
if (!mnemonic) throw new Error("MNEMONIC env variable is required");

export const initWallet = async () => {
  const { publicKey, secretKey } = await mnemonicToPrivateKey(mnemonic);
  const wallet = WalletContractV4.create({ workchain: 0, publicKey });
  const contract = tonClient.open(wallet);

  return { contract, secretKey };
};
