import React, { useState, useRef } from 'react';
import { SignatureTemplate } from 'cashscript';
import { defaultAddr, payer, payee, payerAddr, payeeAddr } from './common';
import { InfoComponent } from './info';
import { HoverableHeading, HoverableSubHeading } from './hoverable';
import { binToHex, numberToBinUint32LE } from '@bitauth/libauth';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { binToNum } from '../utils/helpers';

const initialSendAmountState = 1000
const initialMinerFeeState = 1116 // Close to min relay fee of the network.
const initialRevokeMinerFeeState = 542


export const AgreementContract = (props) => {

    const {
      agreementContract,
      agreementContractAmount,
      agreementScriptHash,
      nextAgreementContractAddress
    } = props;

    const remainingAmount = binToNum(props?.remainingAmount);

    const [ metaData, setMetaData ] = useState("Metadata:")
    const [ errorMessage, setErrorMessage ] = useState()

    const [ epochState, setEpochState ] = useState(binToNum(props?.epoch))
    const epochInputRef = useRef<any>(null);
    const onChangeEpoch = (event) => {
      const epoch = numberToBinUint32LE(parseInt(event.target.value))
      props.onChangeContractDetails({ ...props, epoch, stateIndex: props.stateIndex })
      setEpochState(event.target.value)
    }

    const [ maxAmountPerEpochState, setMaxAmountPerEpochState ] = useState(binToNum(props?.maxAmountPerEpoch))
    const maxAmountPerEpochInputRef = useRef<any>(null);
    const onChangeMaxAmountPerEpoch = (event) => {
      const maxAmountPerEpochNum = parseInt(event.target.value)
      if (maxAmountPerEpochNum < 546) {
        setErrorMessage("Max Amount/Epoch should be greater than 546")
      }
      const maxAmountPerEpoch = numberToBinUint32LE(maxAmountPerEpochNum)
      props.onChangeContractDetails({ ...props, maxAmountPerEpoch, stateIndex: props.stateIndex })
      setMaxAmountPerEpochState(maxAmountPerEpochNum)
    }
  
    const [ remainingTimeState, setRemainingTimeState ] = useState(binToNum(props?.remainingTime))
    const remainingTimeInputRef = useRef<any>(null);
    const onChangeRemainingTime = (event) => {
      const remainingTime = numberToBinUint32LE(parseInt(event.target.value))
      props.onChangeContractDetails({ ...props, remainingTime, stateIndex: props.stateIndex })
      setRemainingTimeState(event.target.value)
    }

    const [ validFromState, setValidFromState ] = useState(binToNum(props?.validFrom))
    const validFromInputRef = useRef<any>(null);
    const onChangeValidFrom = (event) => {
      const validFromNum = parseInt(event.target.value)
      if (validFromNum < 1) {
        setErrorMessage("Epoch should be greater than 0")
      }
      const validFrom = numberToBinUint32LE(validFromNum)
      props.onChangeContractDetails({ ...props, validFrom, stateIndex: props.stateIndex })
      setValidFromState(validFromNum)
    }

    const createNextState = (param = {}) => {
      let nextContractProps = {
        payerPk: props.payerPk,
        payeePk: props.payeePk,
        epoch: numberToBinUint32LE(epochState),
        maxAmountPerEpoch: numberToBinUint32LE(maxAmountPerEpochState),
        remainingTime: numberToBinUint32LE(remainingTimeState),
        remainingAmount: numberToBinUint32LE(remainingAmount - sendAmountState),
        validFrom: numberToBinUint32LE(validFromState),
        stateIndex: props.stateIndex + 1
      }

      if (Object.keys(param).length > 0) {
        nextContractProps = { ...nextContractProps, ...param }
      }
      props.createNextState(nextContractProps)
    }
  
    const [ sendAmountState, setSendAmountState ] = useState(initialSendAmountState)
    const sendAmountInputRef = useRef<any>(null);
    const onChangeSendAmount = (event) => {
      let newSendAmount = event.target.value
      if (newSendAmount < 546) {
        setErrorMessage("Spending amount should be greater than 546")
      }
      if (newSendAmount > remainingAmount) {
        setErrorMessage(`Spending amount should be less than ${remainingAmount}`)
      }
      setSendAmountState(newSendAmount)
      createNextState({ remainingAmount: numberToBinUint32LE(remainingAmount - newSendAmount) })
    }
  
    const [ minerFeeState, setMinerFeeState ] = useState(initialMinerFeeState)
    const minerFeeInputRef = useRef<any>(null);
    const onChangeMinerFee = (event) => { setMinerFeeState(event.target.value)}

    const [ revokeMinerFeeState, setRevokeMinerFeeState ] = useState(initialRevokeMinerFeeState)
    const revokeMinerFeeInputRef = useRef<any>(null);
    const onChangeRevokeMinerFee = (event) => {setRevokeMinerFeeState(event.target.value)}

    const revoke = async () => {  
      const change = agreementContractAmount - revokeMinerFeeState
  
      setMetaData(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${revokeMinerFeeState} change: ${change}`)
  
      if (change < 546){
        setErrorMessage("Revokable amount should be greater than 546")
        return
      }

      const tx = await agreementContract.functions
      .revoke(new SignatureTemplate(payer))
      .withHardcodedFee(revokeMinerFeeState)
      .to(defaultAddr, change)
      .send()
  
      console.log(tx)
      console.log(JSON.stringify(tx))

    }
  
    const handleSubmit = async () => {
      const sendAmount = parseInt(sendAmountState);
      const minerFee = parseInt(minerFeeState);
      const iAgreementContractAmount = parseInt(agreementContractAmount);
      const amountToNextState = iAgreementContractAmount - minerFeeState - sendAmountState;
      setMetaData(`Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFeeState} sendAmount: ${sendAmountState} amountToNextState: ${amountToNextState}`)

      if (!nextAgreementContractAddress){
        setErrorMessage("Next contract state is not derived. Press the + icon on the bottom right.")
        return
      }

      if (amountToNextState < 546) {
        setErrorMessage("Amount to next state should be greater than 546. amountToNextState = balance - minerFee - sendAmount")
        return
      }

      if (sendAmount < 546) {
        setErrorMessage("Spending amount to payee should be greater than 546")
        return
      }

      const aggrementTx = await agreementContract.functions
      .spend(
        new SignatureTemplate(payee),
        amountToNextState,
        sendAmount
      )
      .withHardcodedFee(minerFee)
      .to(payeeAddr, sendAmount)
      .to(nextAgreementContractAddress, amountToNextState)
      // .build()
      .send();

      console.log(aggrementTx)
      console.log(JSON.stringify(aggrementTx))

    }

    

    return (
      <div className="columns is-multiline pb-4">
        <div className="columns column is-full is-centered">
        <div className="box is-two-thirds column" style={{ backgroundColor: 'rgb(42, 45, 47)' }}>
  
        <div className="columns">
          <div className="title has-text-white pl-3 pt-3">Contract State-{props.stateIndex}</div>
            <div className="column has-text-right">
              <InfoComponent/>
            </div>
        </div>
          
          <div className="mb-2 pb-3" style={{ borderBottom: '2px solid rgb(30, 32, 35)' }}>
            <label className="label has-text-grey-lighter">{agreementContract?.address}
              <a target='_' href={`https://explorer.bitcoin.com/bch/address/${agreementContract?.address}`}>
                <FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
              </a>
            </label>
            <div className="control has-text-grey-lighter">
                Balance: {agreementContractAmount}
            </div>
          </div>
          
          <div className="mr-2">
            <div className="title has-text-white is-4 pt-2">{'> Constructor'}</div>

            <div className="columns column mb-0 pb-0">
              <label className="label has-text-grey-lighter pr-3">PayerPk</label>
              <div className="control has-text-grey-light">
                0x{binToHex(props.payerPk)}
              </div>
            </div>

            <div className="columns column mb-0 pb-1">
              <label className="label has-text-grey-lighter pr-3">PayeePk</label>
              <div className="control has-text-grey-light">
                0x{binToHex(props.payeePk)}
              </div>
            </div>

            <div className="columns column mb-0 pb-0">
              <label className="label has-text-grey-lighter pr-3">Payer Address</label>
              <label className="label has-text-grey-light">{payerAddr}
                <a target='_' href={`https://explorer.bitcoin.com/bch/address/${payerAddr}`}>
                  <FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
                </a>
              </label>
            </div>

            <div className="columns column mb-0 pb-0">
              <label className="label has-text-grey-lighter pr-3">Payee Address</label>
              <label className="label has-text-grey-light">{payeeAddr}
                <a target='_' href={`https://explorer.bitcoin.com/bch/address/${payeeAddr}`}>
                  <FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
                </a>
              </label>
            </div>

            <div className="field pb-3 pt-3" style={{ borderBottom: '2px solid rgb(30, 32, 35)'}}>
              <div className="columns">

                <div className="column">
                  <div className="columns pl-3">
                    <HoverableSubHeading
                      title={'Epoch'}
                      info={"Time frame in block height."}
                    />
                  </div>
                  <div className="control">
                    <input value={epochState}
                      onChange={onChangeEpoch}
                      ref={epochInputRef}
                      disabled={props.stateIndex !== 0}
                      className="input has-text-grey-light has-background-dark"
                      style={{  }}
                      type="text"
                      placeholder="Remaining Time"
                    />
                  </div>
                </div>

                <div className="column">
                  <div className="columns pl-3">
                    <HoverableSubHeading
                      title={'MaxAmount/Epoch'}
                      info={"Maximum amount spendable per epoch."}
                    />
                  </div>
                  <div className="control">
                    <input value={maxAmountPerEpochState}
                      onChange={onChangeMaxAmountPerEpoch}
                      ref={maxAmountPerEpochInputRef}
                      disabled={props.stateIndex !== 0}
                      className="input has-text-grey-light has-background-dark"
                      style={{  }}
                      type="text"
                      placeholder="Remaining Time"
                    />
                  </div>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="columns pl-3">
                    <HoverableSubHeading
                      title={'Remaining Time'}
                      info={"Current Valid From - Last Valid From = Remaining Time"}
                    />
                  </div>
                  <div className="control">
                    <input value={remainingTimeState}
                      disabled={true}
                      onChange={onChangeRemainingTime}
                      ref={remainingTimeInputRef}
                      className="input has-text-grey-light has-background-dark"
                      type="text"
                      placeholder="Remaining Time"
                    />
                  </div>
                </div>

                <div className="column">
                  <div className="columns pl-3">
                  <HoverableSubHeading
                    title={'Remaining Spendable Amount'}
                    info={"Revoke invoked by Payer, has less miner fee."}
                  />
                  </div>
                  <div className="control">
                    <input value={remainingAmount}
                      disabled={true}
                      className="input has-text-grey-light has-background-dark"
                      type="text"
                      placeholder="Remaining Amount"
                    />
                  </div>
                </div>
              </div>

              <div className="columns column is-half pl-0">
                <div className="column">
                  <label className="label has-text-grey-lighter">Block Height/ Valid From</label>
                  <div className="control">
                    <input value={validFromState}
                      onChange={onChangeValidFrom}
                      ref={validFromInputRef}
                      className="input has-text-grey-light has-background-dark"
                      type="text"
                      placeholder="Valid From"
                    />
                  </div>
                </div>
              </div>

              <div className="columns column pt-0">
                <label className="label has-text-grey-lighter pr-3">Agreement script hash </label>
                <div className="control has-text-grey-light">
                    0x{agreementScriptHash}
                </div>
              </div>

            </div>
          </div>

          <div className="columns">
            <div className="column" style={{ borderBottom: '2px solid rgb(30, 32, 35)' }}>
              <div className="columns is-4 mt-2 pl-3">
                <HoverableHeading
                  title={'> Spend'}
                  info={"Spend invoked by Payee. The amount should be less than the `MaxAmount/Epoch` and `Remaining Amount`"}
                />
              </div>

              <div className="columns">
                <div className="column">
                  <label className="label has-text-grey-lighter">Amount</label>
                  <div className="control">
                    <input value={sendAmountState}
                      onChange={onChangeSendAmount}
                      ref={sendAmountInputRef}
                      className="input has-text-grey-light has-background-dark"
                      type="text"
                      placeholder="Send Amount"
                    />
                  </div>
                </div>

                <div className="column">
                  <label className="label has-text-grey-lighter">Miner Fee</label>
                  <div className="control">
                    <input value={minerFeeState}
                      onChange={onChangeMinerFee}
                      ref={minerFeeInputRef}
                      className="input has-text-grey-light has-background-dark"
                      type="text"
                      placeholder="Miner Fee"
                    />
                  </div>
                </div>
                
              </div>

              <button
                onClick={handleSubmit}
                style={{ backgroundColor: 'rgb(30, 32, 35)', borderWidth: 0 }}
                className="button has-text-white">
                  Submit Transaction
              </button>

              <div className="columns column mt-3">
                <label className="label has-text-grey-lighter pr-3">Amount To Next State</label>
                <div className="control has-text-grey-light">
                    <code>{agreementContractAmount - sendAmountState - minerFeeState}</code>
                </div>
              </div>


            </div>

            <div className="column" style={{ borderBottom: '2px solid rgb(30, 32, 35)' }}>
              <div className="columns is-4 mt-2">
                <HoverableHeading
                  title={'> Revoke'}
                  info={"Revoke invoked by Payer, has less miner fee."}
                />
              </div>
              <div className="columns">
                <div className="column">
                  <label className="label has-text-grey-lighter">Miner Fee</label>
                  <div className="control">
                    <input value={revokeMinerFeeState}
                      onChange={onChangeRevokeMinerFee}
                      ref={revokeMinerFeeInputRef}
                      className="input has-text-grey-light has-background-dark"
                      type="text"
                      placeholder="Miner Fee"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={revoke}
                className="button has-text-white"
                style={{ backgroundColor: 'rgb(30, 32, 35)', borderWidth: 0 }}>
                  Revoke
              </button>
            </div>
          </div>

          <div className="field">
              <HoverableSubHeading
                  title={'Amount to next state'}
                  info={"If the next contract address is undefined then press the + button on the bottom right. Warning: Next contract state with amount less than 0 will not be spendable by payee."}
                />
              <div className="control">
                <p className="content has-text-grey-light">{nextAgreementContractAddress}</p>
              </div>
            </div>


            <div className="columns">
              <div className="column has-text-right">
                <button onClick={createNextState} className="button has-text-white" style={{ backgroundColor: 'rgb(30, 32, 35)' }}>+</button>
              </div>
            </div>
            <div className="notification">
              Current/Prev Error: {errorMessage}
            </div>

            <div className="field">
              <label className="label has-text-grey-lighter">Metadata</label>
              <div className="control">
                <p className="content has-text-grey-light">{metaData}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="columns column is-full is-centered">
          <div className="column columns m-0 p-0 is-half">
            <div className="column has-text-centered"> <strong className="has-text-white">||</strong> </div>
            <div className="column has-text-centered"> <strong className="has-text-white">||</strong> </div>
          </div>
        </div>

      </div>
    )
  }