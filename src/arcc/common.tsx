import React from 'react';
import { getTemplateContract } from '../contracts';
import { numberToBinUint32LE } from '@bitauth/libauth';
import { buildLockScriptHash } from '../utils/helpers';

import { getOwnerWallet } from '../wallet';

// import { refund } from '../utils';
// refund()

export const defaultAddr = 'bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0'
// eslint-disable-next-line
export const [ owner, ownerPk, ownerPkh, ownerAddr ] = getOwnerWallet()

export const payerPk = ownerPk;
export const payeePk = ownerPk;
export const deadline = numberToBinUint32LE(1)
export const maxAmountPerEpoch = numberToBinUint32LE(5000)
export const epoch = numberToBinUint32LE(1)
export const remainingAmount = numberToBinUint32LE(5000)
export const validFrom = numberToBinUint32LE(695119) // Current height of the blockchain.

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