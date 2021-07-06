import React, { useEffect, useState } from 'react';
import { getTemplateContract } from '../contracts';
import { numberToBinUint32LE } from '@bitauth/libauth';
import { buildLockScriptHash } from '../utils/helpers';

import { getOwnerWallet } from '../wallet';

// import { refund } from '../utils';
// refund()

export const defaultAddr = 'bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0'
// eslint-disable-next-line
export const [ owner, ownerPk, ownerPkh, ownerAddr ] = getOwnerWallet()

export const coOwnerPk = ownerPk;
export const maxSpendable = numberToBinUint32LE(5000)
export const minSpendableInterval = numberToBinUint32LE(0)
export const initialState = numberToBinUint32LE(695119) // Current height of the blockchain.

export const getContractInfo = async (params, contractFile) => {
  let amount = 0

  const contract = await getTemplateContract(params, contractFile)
  const redeemScript = contract.getRedeemScriptHex();
  const completeLockScript = await buildLockScriptHash(redeemScript);

  const Utxos = await contract.getUtxos()
  // @ts-ignore
  if (Utxos.length < 1){
    console.log(contractFile, "No utxo available for this address", contract.address)
    //return
  } else {
    Utxos.sort((a, b) => b.satoshis - a.satoshis)
    // @ts-ignore
    Utxos.forEach((u, idx) => {
      console.log(u)
      amount += u.satoshis
    });
  }

  return [contract, amount, completeLockScript]
}

// export const useContract = (params, contractFile) => {
//     const [ contract, setContract ] = useState();
//     const [ scriptHex, setScriptHex ] = useState();
//     const [ amount, setInputAmount ] = useState(0)
//     console.log(contractFile)
//     useEffect(() => {
//       const makeCall = async () => {
        
//         getTemplateContract(params, contractFile).then(async (res) => {
//           const redeemScript = res.getRedeemScriptHex();
//           const completeLockScript = await buildLockScriptHash(redeemScript);
//           setScriptHex(completeLockScript)

//           setContract(res)
//           let amount = 0
//           const Utxos = await res.getUtxos()
//           // @ts-ignore
//           if (Utxos.length < 1){
//             console.log(contractFile, "No utxo available for this address", res.address)
//             //return
//           } else {
//             Utxos.sort((a, b) => b.satoshis - a.satoshis)
//             // @ts-ignore
//             Utxos.forEach((u, idx) => {
//               console.log(u)
//               amount += u.satoshis
//             });
//             setInputAmount(amount)
//           }
//           })
        
//       }
//       makeCall()
//     //eslint-disable-next-line
//     }, [contract])
    
//     console.log(contract, amount, scriptHex)
//     return [contract, amount, scriptHex]
//   }
