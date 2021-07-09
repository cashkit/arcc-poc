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

// Block Height
const currentTimeParameter = 695558;
export const newAgeementCurrentTimeParameter = 695558

// const currentTimeParameter = 1625736649;
// const currentTimeParameter = Math.floor(new Date().getTime() / 1000) // current time in seconds.
const epochBlockParameter =  6 // 6 blocks
const remainingTimeBlockParameter =  6 // 6 blocks
export const initialAmount = 3000

export const payerPk = ownerPk;
export const payeePk = ownerPk;
// const payerAddr = bitbox.ECPair.toCashAddress(owner);
// const payeeAddr = bitbox.ECPair.toCashAddress(owner);

export const maxAmountPerEpoch = numberToBinUint32LE(initialAmount)
export const epoch = numberToBinUint32LE(epochBlockParameter)
export const remainingTime = numberToBinUint32LE(remainingTimeBlockParameter)
export const remainingAmount = numberToBinUint32LE(initialAmount)
export const validFrom = numberToBinUint32LE(currentTimeParameter) // Current height of the blockchain.
export const newContractValidFrom = numberToBinUint32LE(newAgeementCurrentTimeParameter)


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


export const CommonComponent = () => {
  return (
    <div className="box column mr-2">
      <div className="field">
        <label className="label">Payer Addr</label>
        <div className="control">
            {ownerAddr}
        </div>
      </div>
      <div className="field">
        <label className="label">Payee Addr</label>
        <div className="control">
          {ownerAddr}
        </div>
      </div>
    </div>
    )
}