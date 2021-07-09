import React, { useState } from 'react';
import { SignatureTemplate } from 'cashscript';
import {
    defaultAddr,
    owner,
    ownerPkh,
    ownerAddr,
    initialAmount,
    newContractValidFrom
} from './common';
import { numberToBinUint32LE } from '@bitauth/libauth';


export const AgreementContract = (props) => {

    const {
      ownerContract,
      ownerContractAmount,
      payerContractScriptHash,
      agreementContract,
      agreementContractAmount,
      agreementScriptHash,
      nextAgreementContractAddress
    } = props;
  
    console.log(props)

    const [ tx, setTx ] = useState("")
    const [ metaData, setMetaData ] = useState("Metadata:")

    const ownerContractAddr = ownerContract.address

    const reclaim = async () => {
  
      const minerFee = 542 // Close to min relay fee of the network.
      const change = agreementContractAmount - minerFee
  
      setMetaData(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} change: ${change}`)
  
      const tx = await agreementContract.functions
      .reclaim(new SignatureTemplate(owner))
      .withHardcodedFee(minerFee)
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
      .revokeAlmostFairly(new SignatureTemplate(owner))
      .withHardcodedFee(minerFee)
      .to(ownerAddr, change)
      // .to(ownerContractAddr, change)
      .send()
  
      console.log(tx)
  
      setTx("Tx status: ", JSON.stringify(tx))
    }
  
    const handleSubmit = async () => {
      const minerFee = 1216 // Close to min relay fee of the network.
      const sendAmount = 1000;
      const amountToNextState = agreementContractAmount - minerFee - sendAmount;
    
      console.log(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} sendAmount: ${sendAmount} amountToNextState: ${amountToNextState}`)

      // const selfAddr = agreementContract.address

      // 3000 is the previous contract's input value.

      // let nextContractRemainingAmount;
      // const isNewEpoch = true;
      // if (isNewEpoch) {
      //   nextContractRemainingAmount = contractAmount
      // } else {
      //   nextContractRemainingAmount = initialAmount - sendAmount
      // }

      const aggrementTx = await agreementContract.functions
        .spend(
          new SignatureTemplate(owner),
          amountToNextState,
          sendAmount
        )
        .alterByteCode()
        .withHardcodedFee(minerFee)
        .to(ownerAddr, sendAmount)
        .to(nextAgreementContractAddress, amountToNextState)
        // .build()
        // .send();
      
      // const haha = numberToBinUint32LE(1625736649)
      // console.log(haha)
      
      // console.log(agreementContract.redeemScript)
      // console.log(agreementContract.redeemScript[0])

      // agreementContract.redeemScript.shift()
      // agreementContract.redeemScript.unshift(newContractValidFrom)
      // // agreementContract.redeemScript[0] = newContractValidFrom
      // // console.log(modifyRedeemScript)
      // console.log(agreementContract.redeemScript)

      const m = await aggrementTx.build()

      console.log(m)
      
  
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
        
        <div className="pt-4 field">
          <label className="label">Payer Contract Hash</label>
          <div className="control">
          <p className="content">{payerContractScriptHash}</p>
          </div>
        </div>

        <div className="pt-4 field">
          <label className="label">Next Contract Agreement Addr</label>
          <div className="control">
          <p className="content">{nextAgreementContractAddress}</p>
          </div>
        </div>
        
      </div>
    )
  }