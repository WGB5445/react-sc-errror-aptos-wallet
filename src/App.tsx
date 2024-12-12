import { Aptos, AptosConfig, Network, Account, AccountAddress, Ed25519PublicKey, Hex, SimpleTransaction, AptosScriptComposer, CallArgument, TransactionPayloadScript, Deserializer, Serializer, Serialized, Script, deserializeFromScriptArgument, ScriptFunctionArgument } from "@aptos-labs/ts-sdk";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";

function App() { 

  const [state, setState] = useState("");
  const {account, signAndSubmitTransaction} = useWallet();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <WalletSelector />
      <button disabled={! account?.address} onClick={async ()=>{

        let aptos_client = new Aptos(new AptosConfig({network: Network.TESTNET}));

        const transaction = await aptos_client.transaction.build.scriptComposer({
            sender: account!.address,  
            builder: async (builder: AptosScriptComposer) => {
                const coin = await builder.addBatchedCalls({
                function: "0x1::coin::withdraw",
                  functionArguments: [CallArgument.new_signer(0), 1],
                  typeArguments: ["0x1::aptos_coin::AptosCoin"],
              });
        
           // Pass the returned value from the first function call to the second call
              const fungibleAsset = await builder.addBatchedCalls({
               function: "0x1::coin::coin_to_fungible_asset",
                functionArguments: [coin[0]],
                 typeArguments: ["0x1::aptos_coin::AptosCoin"],
              });
        
              await builder.addBatchedCalls({
            function: "0x1::primary_fungible_store::deposit",
                functionArguments: ["0x1", fungibleAsset[0]],
               typeArguments: [],
             });
             return builder;
           }
        })

        let deserializer = new Deserializer(transaction.rawTransaction.payload.bcsToBytes());
        
        const bytecode = deserializer.deserializeBytes();
        let script = new Script(bytecode, [], []);

        // let payload = TransactionPayloadScript.load();
          console.log(script.type_args.forEach((arg) => console.log(arg.toString())));
        signAndSubmitTransaction({
          data: {
            typeArguments: script.type_args,
            bytecode: script.bytecode,
            functionArguments: script.args.map((arg) => {
              let se = new Serializer ();
              arg.serializeForScriptFunction(se);
              return new Serialized(se.toUint8Array());
            }),
          }
        }).then((result)=>{
          setState(JSON.stringify(result));
          console.log(result);
        })  

      }}> Transfer </button>
      <div>
        {state}
      </div>
    </div>
  );
}


export default App
