import { Aptos, AptosConfig, Network, Account, AccountAddress, Ed25519PublicKey, Hex } from "@aptos-labs/ts-sdk";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";

function App() { 

  const [state, setState] = useState("");
  const {account, } = useWallet();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <WalletSelector />
      <button disabled={! account?.address} onClick={async ()=>{

        let aptos_client = new Aptos(new AptosConfig({network: Network.MAINNET}));

       let txn = await aptos_client.transaction.build.simple({
            sender: account!.address,
            data :{
              typeArguments:[],
              function: "0x1::resource_account::create_resource_account",
              functionArguments: [
                Hex.fromHexInput(Account.generate().accountAddress.toString()).toUint8Array(),
                Hex.fromHexInput(AccountAddress.fromString(account!.address).toString()).toUint8Array()
              ]
            },
            withFeePayer: true
        });

        let i = await aptos_client.transaction.simulate.simple({
          signerPublicKey: new Ed25519PublicKey(account!.publicKey as string),
          transaction: txn,
          feePayerPublicKey: new Ed25519PublicKey("0xc53e27fc56b9573c8547f44973b7cc10a9c1656730d7b86152f70f73d65dbf62")
        })

        console.log(i[0])
        setState(JSON.stringify(i[0], null, "\t" ))

      }}> Test </button>
      <div>
        {state}
      </div>
    </div>
  );
}


export default App
