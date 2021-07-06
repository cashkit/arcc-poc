import React, { useState } from 'react';
import { SignatureTemplate } from 'cashscript';
import {
    coOwnerPk,
    defaultAddr,
    initialState,
    owner,
    ownerPk,
    ownerPkh,
    ownerAddr,
    maxSpendable,
    minSpendableInterval
} from './common';

import { lockScriptToAddress, addressToLockScript } from '../utils/helpers';



export const AgreementContract = (props) => {

    const { ownerContract, ownerContractAmount, ownerScriptHash, agreementContract, agreementContractAmount, agreementScriptHash } = props;
  
    console.log(props)

    const [ tx, setTx ] = useState("")
    const [ metaData, setMetaData ] = useState("Metadata:")
  
    console.log("========================================================")

    // const ownerLockScript = addressToLockScript(ownerContract.address)
    // const ownerLockScript = '0x'+ownerScriptHash

    const ownerContractAddr = ownerContract.address

    // console.log(ownerLockScript)
    // const ownerLockScriptHex = '0x'+ownerLockScript;
    // const ownerContractAddr = lockScriptToAddress(ownerLockScript);
    // console.log("ownerContractAddr: ", ownerContractAddr)
    // console.log("ownerLockScriptHex: ", ownerLockScriptHex)

    const reclaim = async () => {
  
      const minerFee = 475 // Close to min relay fee of the network.
      const change = agreementContractAmount - minerFee
  
      setMetaData(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} change: ${change}`)
  
      const tx = await agreementContract.functions
      .reclaim(new SignatureTemplate(owner))
      .to(defaultAddr, change)
      .send()
  
      console.log(tx)
  
      setTx("Tx status: ", JSON.stringify(tx))
    }

    const revoke = async () => {
  
      const minerFee = 1075 // Close to min relay fee of the network.
      const change = agreementContractAmount - minerFee
  
      setMetaData(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} change: ${change}`)
  
      const tx = await agreementContract.functions
      .revoke(new SignatureTemplate(owner), minerFee)
      .to(ownerContractAddr, change)
      .send()
  
      console.log(tx)
  
      setTx("Tx status: ", JSON.stringify(tx))
    }
  
    const handleSubmit = async () => {
      const minerFee = 1016 // Close to min relay fee of the network.
      const sendAmount = 1000;
      const contractAmount = agreementContractAmount - minerFee - sendAmount;
  
      const change = agreementContractAmount - minerFee
      // setMetaData(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} change: ${change}`)
  
      console.log(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} change: ${change}`)
    
      // const ownerScriptHashHex = '0x' + ownerLockScript
      const selfAddr = agreementContract.address

      // console.log(ownerScriptHashHex)
      console.log(selfAddr)

      const aggrementTx = await agreementContract.functions
        .spend(
          new SignatureTemplate(owner),
          minerFee,
          sendAmount,
          ownerPkh
        )
        // .withFeePerByte(1)
        .withHardcodedFee(minerFee)
        .to(ownerAddr, sendAmount)
        .to(selfAddr, contractAmount)
        // .build()
        // .send();    
  
      console.log(aggrementTx)
  
      setTx("aggrementTx status: ", JSON.stringify(aggrementTx))
  
    }
  
    return (
      <div className="box column mr-2">
        <div className="title box">Agreement Contract</div>
  
        <div className="field">
          <label className="label">Addr</label>
          <div className="control">
              {agreementContract?.address}
          </div>
          <div className="control">
              Balance: {agreementContractAmount}
          </div>
        </div>
  
        <div className="field">
          <label className="label">owner pub key Addr</label>
          <div className="control">
              {ownerAddr}
          </div>
        </div>
       
        <div className="field">
          <label className="label">Agreement script hash</label>
          <div className="control">
              0x{agreementScriptHash}
          </div>
        </div>

        <div className="field">
          <label className="label">Metadata</label>
          <div className="control">
            <p className="content">{metaData}</p>
          </div>
        </div>
  
        <div className="control">
          <button onClick={handleSubmit} className="button has-background-danger has-text-primary-light">Submit Transaction</button>
          <button onClick={revoke} className="ml-6 button has-text-danger-dark	">Revoke</button>
          <button onClick={reclaim} className="ml-6 button has-text-danger-dark	">Reclaim Transaction</button>
        </div>
  
        <div className="pt-4 field">
          <label className="label">Tx Info</label>
          <div className="control">
          <p className="content">{tx}</p>
          </div>
        </div>
  
        
      </div>
    )
  }