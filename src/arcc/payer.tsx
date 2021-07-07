import React, { useState } from 'react';
import { SignatureTemplate } from 'cashscript';
import { defaultAddr, owner, ownerAddr} from './common';


export const OwnerContract = (props) => {

    const { ownerContract, ownerContractAmount, ownerScriptHash, agreementContract, agreementContractAmount, agreementScriptHash } = props;
  
    const [ tx, setTx ] = useState("")
    const [ metaData, setMetaData ] = useState("Metadata:")

    const reclaim = async () => {
      const minerFee = 350 // Close to min relay fee of the network.
      const change = ownerContractAmount - minerFee
  
      setMetaData(`Values in sats: Input ownerContractAmount: ${ownerContractAmount}, Miner Fee: ${minerFee} change: ${change}`)
  
      const tx = await ownerContract.functions
      .spend(new SignatureTemplate(owner))
      .to(defaultAddr, change)
      .send()
  
      console.log(tx)
  
      setTx("Tx status: ", JSON.stringify(tx))
    }
  
    const handleSubmit = async () => {
      const minerFee = 820 // Close to min relay fee of the network.

      const change = ownerContractAmount - minerFee
      setMetaData(`Values in sats: Input ownerContractAmount: ${ownerContractAmount}, Miner Fee: ${minerFee} change: ${change}`)
    
      const agreementScriptHashHex = '0x' + agreementScriptHash
      const toAddr = agreementContract.address

      console.log("Paying to script hash: ", agreementScriptHashHex)
      console.log("Address: ", toAddr)


      const ownerTx = await ownerContract.functions
        .allow(
          new SignatureTemplate(owner),
          minerFee,
          agreementScriptHashHex,
        )
        //.withFeePerByte(1)
        .withHardcodedFee(minerFee)
        .to(toAddr, change)
        //.to(ownerContract.address, sendAmount)
        // .build()
        .send();  
  
      console.log(ownerTx)
  
    }
  
    return (
      <div className="box column mr-2">
        <div className="title box">Owner Contract</div>
  
        <div className="field">
          <label className="label">Addr</label>
          <div className="control">
              {ownerContract?.address}
          </div>
          <div className="control">
              {ownerContractAmount}
          </div>
        </div>
  
        <div className="field">
          <label className="label">owner pub key Addr</label>
          <div className="control">
              {ownerAddr}
          </div>
        </div>

        <div className="field">
          <label className="label">owner script hash</label>
          <div className="control">
              0x{ownerScriptHash}
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
  