import { Aptos, AptosConfig, Network, Account, AccountAddress, Ed25519PublicKey, Hex, SimpleTransaction, AptosScriptComposer, CallArgument, TransactionPayloadScript, Deserializer, Serializer, Serialized, Script, deserializeFromScriptArgument, ScriptFunctionArgument, TypeTag } from "@aptos-labs/ts-sdk";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Buffer } from "buffer";
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
        const index = deserializer.deserializeUleb128AsU32();
        if (index !== 0) {
          throw new Error("Invalid index for TransactionPayloadScript");
        }
        const bytecode = deserializer.deserializeBytes();
        const type_args = deserializer.deserializeVector(TypeTag);
        const length = deserializer.deserializeUleb128AsU32();
        const args = new Array<ScriptFunctionArgument>();
        for (let i = 0; i < length; i += 1) {
          const scriptArgument = deserializeFromScriptArgument(deserializer);
          args.push(scriptArgument);
        }
        let script = new Script(bytecode, type_args, args);

        /*
        const bytecode = deserializer.deserializeBytes();
        const type_args = deserializer.deserializeVector(TypeTag);
        const length = deserializer.deserializeUleb128AsU32();
        const args = new Array<ScriptFunctionArgument>();
        for (let i = 0; i < length; i += 1) {
          const scriptArgument = deserializeFromScriptArgument(deserializer);
          args.push(scriptArgument);
        }
        return new Script(bytecode, type_args, args);
        */

        // let payload = TransactionPayloadScript.load();
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
