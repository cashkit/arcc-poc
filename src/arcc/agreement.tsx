import React, { useState } from 'react';
import { SignatureTemplate } from 'cashscript';
import { defaultAddr, owner, ownerAddr } from './common';


export const AgreementContract = (props) => {

    const {
      // ownerContract,
      // ownerContractAmount,
      // payerContractScriptHash,
      agreementContract,
      agreementContractAmount,
      agreementScriptHash,
      nextAgreementContractAddress
    } = props;
  
    console.log(props)
    const [ metaData, setMetaData ] = useState("Metadata:")

    const revoke = async () => {
  
      const minerFee = 942 // Close to min relay fee of the network.
      const change = agreementContractAmount - minerFee
  
      setMetaData(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} change: ${change}`)
  
      const tx = await agreementContract.functions
      .revoke(new SignatureTemplate(owner))
      .withHardcodedFee(minerFee)
      .to(defaultAddr, change)
      .send()
  
      console.log(tx)
      console.log(JSON.stringify(tx))  
    }
  
    const handleSubmit = async () => {
      const minerFee = 1216 // Close to min relay fee of the network.
      const sendAmount = 1000;
      const amountToNextState = agreementContractAmount - minerFee - sendAmount;
    
      console.log(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} sendAmount: ${sendAmount} amountToNextState: ${amountToNextState}`)

      const aggrementTx = await agreementContract.functions
        .spend(
          new SignatureTemplate(owner),
          amountToNextState,
          sendAmount
        )
        .withHardcodedFee(minerFee)
        .to(ownerAddr, sendAmount)
        .to(nextAgreementContractAddress, amountToNextState)
        // .build()
        .send();

      console.log(aggrementTx)
      console.log(JSON.stringify(aggrementTx))
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