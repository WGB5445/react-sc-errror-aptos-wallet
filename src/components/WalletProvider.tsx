"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { BitgetWallet } from "@bitget-wallet/aptos-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { MSafeWalletAdapter } from "@msafe/aptos-wallet-adapter";
import { OKXWallet } from "@okwallet/aptos-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { TrustWallet } from "@trustwallet/aptos-wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";


export const WalletProvider = ({ children }: PropsWithChildren) => {

  // const aptosConfig = new AptosConfig({ network: process.env.NEXT_PUBLIC_APP_NETWORK as Network || Network.TESTNET });

  const wallets :any[] = [
    new BitgetWallet(),
    new FewchaWallet(),
    new MartianWallet(),
    new MSafeWalletAdapter(),
    new PontemWallet(),
    new TrustWallet(),
    new OKXWallet(),
  ];

  return (
    // <AptosProvider aptos={aptos}>
      <AptosWalletAdapterProvider
        plugins={wallets}
        // autoConnect={autoConnect}
        dappConfig={{
          network:   Network.TESTNET,
          aptosConnect: { dappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5" },
          mizuwallet: {
            manifestURL:
              "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
          },
        }}
        onError={(error: any) => {
          console.log(error)
        }}
      >
        {children}
      </AptosWalletAdapterProvider>
    // </AptosProvider>
  );
};