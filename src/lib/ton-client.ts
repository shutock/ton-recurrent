import dotenv from "dotenv";
import { TonClient } from "@ton/ton";

dotenv.config();

const { IS_TESTNET, API_KEY } = process.env;

const endpoints = {
  testnet: "https://testnet.toncenter.com/api/v2/jsonRPC",
  mainnet: "https://toncenter.com/api/v2/jsonRPC",
};

export const tonClient = new TonClient({
  endpoint: endpoints[IS_TESTNET === "true" ? "testnet" : "mainnet"],
  apiKey: API_KEY,
});
