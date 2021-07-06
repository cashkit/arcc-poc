import React, { useEffect, useState } from 'react';
import { SignatureTemplate, Network } from 'cashscript';
import * as cashCompiler from 'cashc';
import { getOwnerWallet } from '../wallet';
import { getTemplateContract } from '../contracts';
import { numberToBinUint32LE } from '@bitauth/libauth';
import { scriptToAddress } from '../utils/script'; 

import { lockScriptToAddress, redeemToAddress, addressToLockScript } from '../utils/helpers';

// import { refund } from '../utils';
// refund()

const defaultAddr = 'bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0'
// eslint-disable-next-line
const [ owner, ownerPk, ownerPkh, ownerAddr ] = getOwnerWallet()

const coOwnerPk = ownerPk;
const maxSpendable = numberToBinUint32LE(5000)
const minSpendableInterval = numberToBinUint32LE(0)
const initialState = numberToBinUint32LE(694896) // Current height of the blockchain.
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


export const AgreementContract = () => {

  //const { ownerContract } = props;

  const [ tx, setTx ] = useState("")
  const [ metaData, setMetaData ] = useState("Metadata:")
  const [ agreementRedeemScript, setRedeemScript ] = useState();

  const ownerContractParams = [ownerPk]
  const [ ownerContract, ownerContractAmount ] = useContract(ownerContractParams, 'Owner.cash')


  const parentContractHash = cashCompiler.utils.hash160(ownerContract?.redeemScript)

  console.log("parentContractHash", parentContractHash);
  const parentContractHashBuf = Buffer.from(parentContractHash);
  console.log("parentContractHashBuf hex", parentContractHashBuf.toString('hex'))


  const agreementContractParams = [ownerPk, parentContractHash, coOwnerPk, maxSpendable, minSpendableInterval, initialState]
  const [ agreementContract, agreementContractAmount ] = useContract(agreementContractParams, 'Agreement.cash')


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

  const handleSubmit = async () => {
    const minerFee = 1016 // Close to min relay fee of the network.
    const sendAmount = 1000;
    const contractAmount = agreementContractAmount - minerFee - sendAmount;

    const change = agreementContractAmount - minerFee
    // setMetaData(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} change: ${change}`)

    console.log(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFee} change: ${change}`)

    console.log("Creating the redeem script for joint account")

    const jointTx = await agreementContract.functions
      .spend(
        new SignatureTemplate(owner),
        minerFee,
        sendAmount,
        ownerPkh
      )
      // .withFeePerByte(1)
      //.withHardcodedFee(minerFee)
      .to(ownerAddr, sendAmount)
      .to(agreementContract.address, contractAmount)
      // .build()
      // .send();    

    console.log(jointTx)

    const redeemscript = jointTx.redeemScript
    const addr = scriptToAddress(redeemscript, Network.MAINNET)
    console.log("addr", addr)

    const redeemScriptBuf = Buffer.from(redeemscript);
    const truncatedRc = redeemScriptBuf.slice(6)
    const truncatedRcHex = truncatedRc.toString('hex')
    console.log("truncatedRc: ", truncatedRc)
    // const finalRedeemScript = ownerPk + parentContractHash + coOwnerPk + maxSpendable + minSpendableInterval + initialState + truncatedRc;
    const finalRedeemScript: Buffer | any = [];
    
    const scriptToASMString = cashCompiler.utils.scriptToAsm(redeemscript)
    console.log(scriptToASMString)

    const lhs = scriptToASMString.split(' ');
    const rhs = lhs.splice(6)

    let rhsCopy = [...rhs]

    rhs.map((op, index) => {
      if (!op.includes('OP_')) {
        console.log(op, op.length, op.length/2);
        //rhsCopy.splice(index, 0, 'OP_PUSHDATA1');
        //rhsCopy.splice(index, 0, '0x'+JSON.stringify(op.length/2));
        //rhsCopy.splice(index, 0, op);
        // rhsCopy[index] = op;
        // console.log(op, index)
      }
    })
    
    console.log(rhsCopy)

    const finale = lhs.concat(rhsCopy);
    const strfinale = finale.join(" ");
    console.log(strfinale);
    // console.log(cashCompiler.utils.asmToScript(strfinale))
    const strfinaleu8int = cashCompiler.utils.asmToScript(strfinale)
    console.log(strfinaleu8int)
    
    // @ts-ignore
    const  strfinaleBuf = Buffer.from(strfinaleu8int)
    const splicedstrfinaleBuf = strfinaleBuf.slice(6)

    const newAddr = scriptToAddress(strfinaleu8int, Network.MAINNET)
    console.log("newAddr? ", newAddr);

    // New Section begins
    const initialStateBuf = Buffer.from(initialState)
    const initialStateHex = initialStateBuf.toString('hex')
    console.log(initialStateHex)

    const minSpendableIntervalBuf = Buffer.from(minSpendableInterval)
    const minSpendableIntervalHex = minSpendableIntervalBuf.toString('hex')
    console.log(minSpendableIntervalHex)

    const maxSpendableBuf = Buffer.from(maxSpendable)
    const maxSpendableHex = maxSpendableBuf.toString('hex')
    console.log(maxSpendableHex)

    const coOwnerPkBuf = Buffer.from(coOwnerPk)
    const coOwnerPkHex = coOwnerPkBuf.toString('hex')
    console.log(coOwnerPkHex)

    const parentContractHashBuf = Buffer.from(parentContractHash)
    const parentContractHashHex = parentContractHashBuf.toString('hex')
    console.log(parentContractHashHex)

    const ownerPkBuf = Buffer.from(ownerPk)
    const ownerPkHex = ownerPkBuf.toString('hex')
    console.log(ownerPkHex)

    // const finalRedeemScript = initialState + minSpendableInterval + maxSpendable+ coOwnerPk +  parentContractHash + ownerPk + truncatedRc;
    finalRedeemScript.push(...initialStateBuf);
    finalRedeemScript.push(...minSpendableIntervalBuf);
    finalRedeemScript.push(...maxSpendableBuf);
    finalRedeemScript.push(...coOwnerPkBuf);
    finalRedeemScript.push(...parentContractHashBuf);
    finalRedeemScript.push(...ownerPkBuf);
  
    console.log(finalRedeemScript)
    console.log("Hex of funal redeem script", finalRedeemScript.toString('hex'))

    const testbuff = splicedstrfinaleBuf.toString('hex')

    const buildHex = '04' + initialStateHex +
    '04' +
    minSpendableIntervalHex +
    '04' +
    maxSpendableHex +
    '21' +
    coOwnerPkHex +
    '14' +
    parentContractHashHex +
    '21' +
    ownerPkHex +
    // truncatedRcHex
    testbuff

    console.log("0200000001936f7beda36b77cfa712ca7d22a2c066683529e98e76794d02443f8217340a7200000000fd7f031491ba143eee9f633922f3434f620111fe4aff8f3102e80302f80341e1639bda667bfba66022aeb896427bcfa19b820ad73c8d1b47e9e3552ed98e85691c31cf8e12640947b539503a71b2772a5403b27565d9394dcca298d2789c2f414ddd01020000009ba86deceaf05ce60b1952ff2499fbb1b183c54d412770c4d23fb62bb175428f18606b350cd8bf565266bc352f0caddcf01e8fa789dd8a15386327cf8cabe198936f7beda36b77cfa712ca7d22a2c066683529e98e76794d02443f8217340a7200000000fd3e01045c9a0a000400000000048813000021039e1ba72275d96bb9bdb3b73d5e6367ac950af1f422c0ab66ae0527e56dae8a5714b472a266d0bd89c13706a4132ccfb16f7c3b9fcb21039e1ba72275d96bb9bdb3b73d5e6367ac950af1f422c0ab66ae0527e56dae8a575679009c63577a7cad6d6d6d51675679519c635779820134947f77587f547f7701207f755a7a537a6e7c828c7f755c7aa87bbbad7c81587a9458800317a9147e7b7e01877eaa886d6d755167567a529d5679016b7f77820134947f587f547f7701207f547f755b7a577a6e7c828c7f755d7aa87bbbad587a8176b1755a79587a81a16978817c94577a81a269547c7e537a557f777e7b81557994567994567a5880041976a9147e577a7e0288ac7e78577aa0637858800317a9147e5379a97e01877e6e7eaa557988756776aa547988686d6d6d516868a00f000000000000feffffff88a31be3716cc9e60a28a840733c6b3ef5950590269af1ddd0bc1e2af781a339679a0a0041000000524d3e01045c9a0a000400000000048813000021039e1ba72275d96bb9bdb3b73d5e6367ac950af1f422c0ab66ae0527e56dae8a5714b472a266d0bd89c13706a4132ccfb16f7c3b9fcb21039e1ba72275d96bb9bdb3b73d5e6367ac950af1f422c0ab66ae0527e56dae8a575679009c63577a7cad6d6d6d51675679519c635779820134947f77587f547f7701207f755a7a537a6e7c828c7f755c7aa87bbbad7c81587a9458800317a9147e7b7e01877eaa886d6d755167567a529d5679016b7f77820134947f587f547f7701207f547f755b7a577a6e7c828c7f755d7aa87bbbad587a8176b1755a79587a81a16978817c94577a81a269547c7e537a557f777e7b81557994567994567a5880041976a9147e577a7e0288ac7e78577aa0637858800317a9147e5379a97e01877e6e7eaa557988756776aa547988686d6d6d516868feffffff02e8030000000000001976a91491ba143eee9f633922f3434f620111fe4aff8f3188acc00700000000000017a914bbb9ab6460284522dc0174d456dedbfd1d651f0387679a0a00");  

    console.log("Final hex of redeem script", buildHex)
    // const bytecode = cashCompiler.utils.scriptToBytecode(redeemscript)
    console.log("redeemscript", redeemscript)
    console.log("imported redeeme script", "045c9a0a000400000000048813000021039e1ba72275d96bb9bdb3b73d5e6367ac950af1f422c0ab66ae0527e56dae8a5714b472a266d0bd89c13706a4132ccfb16f7c3b9fcb21039e1ba72275d96bb9bdb3b73d5e6367ac950af1f422c0ab66ae0527e56dae8a575679009c63577a7cad6d6d6d51675679519c635779820134947f77587f547f7701207f755a7a537a6e7c828c7f755c7aa87bbbad7c81587a9458800317a9147e7b7e01877eaa886d6d755167567a529d5679016b7f77820134947f587f547f7701207f547f755b7a577a6e7c828c7f755d7aa87bbbad587a8176b1755a79587a81a16978817c94577a81a269547c7e537a557f777e7b81557994567994567a5880041976a9147e577a7e0288ac7e78577aa0637858800317a9147e5379a97e01877e6e7eaa557988756776aa547988686d6d6d516868")
    
    
    console.log("truncatedRcHex", truncatedRcHex)
    console.log("imported redeeme script", "5679009c63577a7cad6d6d6d51675679519c635779820134947f77587f547f7701207f755a7a537a6e7c828c7f755c7aa87bbbad7c81587a9458800317a9147e7b7e01877eaa886d6d755167567a529d5679016b7f77820134947f587f547f7701207f547f755b7a577a6e7c828c7f755d7aa87bbbad587a8176b1755a79587a81a16978817c94577a81a269547c7e537a557f777e7b81557994567994567a5880041976a9147e577a7e0288ac7e78577aa0637858800317a9147e5379a97e01877e6e7eaa557988756776aa547988686d6d6d516868")

    console.log("generated: ", splicedstrfinaleBuf.toString('hex'))

    // const redeemScriptBuf = Buffer.from(redeemscript);
    // const sredeemScriptBuf = redeemScriptBuf.slice(5)
    // console.log("redeemScriptBuf", sredeemScriptBuf)
    // console.log("redeemScriptBuf hex", redeemScriptBuf.toString('hex'))
    // console.log("bytecode", bytecode)

    // const f1 = Buffer.from(buildHex)
    // const f2 = new Uint8Array(f1)

    // const f1 = buildHex
    // const f2 = cashCompiler.utils.asmToScript(f1)
    // console.log(strfinaleu8int)

    setRedeemScript(redeemscript)

    setTx("jointTx status: ", JSON.stringify(jointTx))

  }

  return (
    <>
    <div className="box column mr-2">
      <div className="title box">Agreement Contract</div>

      <div className="field">
        <label className="label">Addr</label>
        <div className="control">
            {agreementContract?.address}
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
      <OwnerContract agreementRedeemScript={agreementRedeemScript} agreementContractAddr={agreementContract?.address}></OwnerContract>
    </>
  )
}

export const OwnerContract = (props) => {

  const { agreementRedeemScript, agreementContractAddr } = props;

  const [ tx, setTx ] = useState("")
  const [ metaData, setMetaData ] = useState("Metadata:")

  const ownerContractParams = [ownerPk]
  const [ ownerContract, ownerContractAmount ] = useContract(ownerContractParams, 'Owner.cash')

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

    // Contract operations

    // const hedgeAddress = lockScriptToAddress(contractParameters.hedgeLockScript.slice(2));
    console.log("owner contract redeem script: ", ownerContract)

    const atls = addressToLockScript(ownerContract.address)
    console.log(atls)
    const tempatls = '0x'+atls;
    console.log(tempatls, tempatls.slice(2))
    // const rsHex = ownerContract.getRedeemScriptHex()
    // console.log("rsHex", rsHex);
    // const rsHexAddr = lockScriptToAddress(rsHex);
    // console.log("rsHexAddr", rsHexAddr);
    const hedgeAddress = lockScriptToAddress(atls);
    console.log(hedgeAddress)

    const addr = await redeemToAddress(ownerContract.getRedeemScriptHex());
    console.log("moment of truth", addr)


    //
    // Owner's contract execution.
    //
    const minerFee = 520 // Close to min relay fee of the network.
    const sendAmount = 1000;
    const contractAmount = ownerContractAmount - minerFee - sendAmount;


    const change = ownerContractAmount - minerFee
    setMetaData(`Values in sats: Input ownerContractAmount: ${ownerContractAmount}, Miner Fee: ${minerFee} change: ${change}`)

    // console.log("Creating the redeem script for joint account")
  
    // const initialState = numberToBinUint32LE(694824) // Current height of the blockchain.
    // let hex = Buffer.from(initialState).toString('hex');
    // console.log(hex)
    //console.log(cashCompiler)
    // console.log("owner contract redeem script hash: ", cashCompiler.utils.hash160(ownerContract.redeemScript))

    // const selfRedeemScriptHash = cashCompiler.utils.hash160(ownerContract.redeemScript)

    

    // console.log("agreementRedeemScript", agreementRedeemScript)
    

    const rcBuf = Buffer.from(agreementRedeemScript);
    const joinHex = rcBuf.toString('hex')
    const toaddr = scriptToAddress(agreementRedeemScript, Network.MAINNET)

    // console.log(toaddr)

    const jointScriptHash = cashCompiler.utils.ripemd160(agreementRedeemScript)


    const ownerTx = await ownerContract.functions
      .allow(
        new SignatureTemplate(owner),
        //minerFee,
        //sendAmount,
        // joinHex,
        jointScriptHash,
        //test1.toString('hex')
        // initialState,
        // minSpendableInterval,
        // maxSpendable,
        // ownerPk,
        // selfRedeemScriptHash,
        // agreementRedeemScript
      )
      .withFeePerByte(1)
      //.withHardcodedFee(minerFee)
      .to(toaddr, ownerContractAmount-520)
      //.to(ownerContract.address, sendAmount)
      // .build()
      // .send();  

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
