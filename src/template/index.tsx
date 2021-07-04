import React, { useEffect, useState } from 'react';
import { SignatureTemplate, Network } from 'cashscript';
import * as cashCompiler from 'cashc';
import { getOwnerWallet } from '../wallet';
import { getTemplateContract } from '../contracts';
import { numberToBinUint32LE } from '@bitauth/libauth';
import { scriptToAddress } from '../utils/script'; 

// import { refund } from '../utils';
// refund()

const defaultAddr = 'bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0'
// eslint-disable-next-line
const [ owner, ownerPk, ownerPkh, ownerAddr ] = getOwnerWallet()

const coOwnerPk = ownerPk;
const maxSpendable = numberToBinUint32LE(5000)
const minSpendableInterval = numberToBinUint32LE(0)
const initialState = numberToBinUint32LE(694865) // Current height of the blockchain.
// let hex = Buffer.from(initialState).toString('hex');
// console.log(hex)

const useContract = (params, contractFile) => {
  const [ contract, setContract ] = useState();
  const [ amount, setInputAmount ] = useState(0)
  useEffect( () => {
    const makeCall = async () => {
      getTemplateContract(params, contractFile).then(async (res) => {
        setContract(res)
        let amount = 0
        const Utxos = await res.getUtxos()
        // @ts-ignore
        if (Utxos.length < 1){
          console.log(contractFile, "No utxo available for this address", res.address)
          //return
        } else {
          Utxos.sort((a, b) => b.satoshis - a.satoshis)
          // @ts-ignore
          Utxos.forEach((u, idx) => {
            console.log(u)
            amount += u.satoshis
          });
          setInputAmount(amount)
        }
        })
      
    }
    makeCall()
  //eslint-disable-next-line
  }, [])
  
  return [contract, amount]
}


export const JointContract = () => {

  //const { ownerContract } = props;

  const [ tx, setTx ] = useState("")
  const [ metaData, setMetaData ] = useState("Metadata:")
  const [ jointRedeemScript, setRedeemScript ] = useState();

  const ownerContractParams = [ownerPk]
  const [ ownerContract, ownerContractAmount ] = useContract(ownerContractParams, 'Owner.cash')


  const parentContractHash = cashCompiler.utils.hash160(ownerContract?.redeemScript)

  console.log("parentContractHash", parentContractHash);
  const parentContractHashBuf = Buffer.from(parentContractHash);
  console.log("parentContractHashBuf hex", parentContractHashBuf.toString('hex'))


  const jointContractParams = [ownerPk, parentContractHash, coOwnerPk, maxSpendable, minSpendableInterval, initialState]
  const [ jointContract, JointContractAmount ] = useContract(jointContractParams, 'JointAccount.cash')
  


  const reclaim = async () => {
    const minerFee = 475 // Close to min relay fee of the network.
    const change = JointContractAmount - minerFee

    setMetaData(`Values in sats: Input JointContractAmount: ${JointContractAmount}, Miner Fee: ${minerFee} change: ${change}`)

    const tx = await jointContract.functions
    .reclaim(new SignatureTemplate(owner))
    .to(defaultAddr, change)
    .send()

    console.log(tx)

    setTx("Tx status: ", JSON.stringify(tx))
  }

  const handleSubmit = async () => {
    const minerFee = 1016 // Close to min relay fee of the network.
    const sendAmount = 1000;
    const contractAmount = JointContractAmount - minerFee - sendAmount;

    const change = JointContractAmount - minerFee
    // setMetaData(`Values in sats: Input JointContractAmount: ${JointContractAmount}, Miner Fee: ${minerFee} change: ${change}`)

    console.log(`Values in sats: Input JointContractAmount: ${JointContractAmount}, Miner Fee: ${minerFee} change: ${change}`)

    console.log("Creating the redeem script for joint account")

    const jointTx = await jointContract.functions
      .spend(
        new SignatureTemplate(owner),
        minerFee,
        sendAmount,
        ownerPkh
      )
      // .withFeePerByte(1)
      .withHardcodedFee(minerFee)
      .to(ownerAddr, sendAmount)
      .to(jointContract.address, contractAmount)
      // .build()
      .send();    

    const redeemscript = jointTx.redeemScript
    const addr = scriptToAddress(redeemscript, Network.MAINNET)
    console.log("addr", addr)

    // const bytecode = cashCompiler.utils.scriptToBytecode(redeemscript)
    console.log("redeemscript", redeemscript)
    const redeemScriptBuf = Buffer.from(redeemscript);
    // const sredeemScriptBuf = redeemScriptBuf.slice(5)
    // console.log("redeemScriptBuf", sredeemScriptBuf)
    // console.log("redeemScriptBuf hex", sredeemScriptBuf.toString('hex'))
    // console.log("bytecode", bytecode)

    console.log(jointTx)

    setRedeemScript(redeemScriptBuf)

    setTx("jointTx status: ", JSON.stringify(jointTx))

  }

  return (
    <>
    <div className="box column mr-2">
      <div className="title box">Joint Contract</div>

      <div className="field">
        <label className="label">Addr</label>
        <div className="control">
            {jointContract?.address}
        </div>
      </div>

      <div className="field">
        <label className="label">owner Addr</label>
        <div className="control">
            {ownerAddr}
        </div>
      </div>
     
      <div className="field">
        <label className="label">Metadata</label>
        <div className="control">
          <p className="content">{metaData}</p>
        </div>
      </div>

      <div className="control">
        <button onClick={handleSubmit} className="button has-background-danger has-text-primary-light">Build Script</button>
        <button onClick={reclaim} className="ml-6 button has-text-danger-dark	">Reclaim Transaction</button>
      </div>

      <div className="pt-4 field">
        <label className="label">Tx Info</label>
        <div className="control">
        <p className="content">{tx}</p>
        </div>
      </div>

      
    </div>
      <OwnerContract jointRedeemScript={jointRedeemScript} jointContractAddr={jointContract?.address}></OwnerContract>
    </>
  )
}

export const OwnerContract = (props) => {

  const { jointRedeemScript, jointContractAddr } = props;

  const [ tx, setTx ] = useState("")
  const [ metaData, setMetaData ] = useState("Metadata:")

  const ownerContractParams = [ownerPk]
  const [ ownerContract, ownerContractAmount ] = useContract(ownerContractParams, 'Owner.cash')

  const reclaim = async () => {
    const minerFee = 400 // Close to min relay fee of the network.
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
    //
    // Owner's contract execution.
    //
    const minerFee = 829 // Close to min relay fee of the network.
    const sendAmount = 1000;
    const contractAmount = ownerContractAmount - minerFee - sendAmount;

    const change = ownerContractAmount - minerFee
    setMetaData(`Values in sats: Input ownerContractAmount: ${ownerContractAmount}, Miner Fee: ${minerFee} change: ${change}`)

    console.log("Creating the redeem script for joint account")
  
    // const initialState = numberToBinUint32LE(694824) // Current height of the blockchain.
    // let hex = Buffer.from(initialState).toString('hex');
    // console.log(hex)
    console.log("owner contract redeem script: ", ownerContract.redeemScript)
    //console.log(cashCompiler)
    console.log("owner contract redeem script hash: ", cashCompiler.utils.hash160(ownerContract.redeemScript))

    // const selfRedeemScriptHash = cashCompiler.utils.hash160(ownerContract.redeemScript)


    const recipientScriptHash = cashCompiler.utils.hash160(jointRedeemScript)

    console.log("jointRedeemScript", jointRedeemScript)
    console.log("recipientScriptHash", recipientScriptHash)

    const ownerTx = await ownerContract.functions
      .allow(
        new SignatureTemplate(owner),
        minerFee,
        sendAmount,
        recipientScriptHash,
        // initialState,
        // minSpendableInterval,
        // maxSpendable,
        // ownerPk,
        // selfRedeemScriptHash,
        // jointRedeemScript
      )
      // .withFeePerByte(1)
      .withHardcodedFee(minerFee)
      .to(ownerAddr, sendAmount)
      .to(jointContractAddr, contractAmount)
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
      </div>

      <div className="field">
        <label className="label">owner Addr</label>
        <div className="control">
            {ownerAddr}
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
