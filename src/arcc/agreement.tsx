import React, { useState, useEffect, useRef } from 'react';
import { SignatureTemplate } from 'cashscript';
import { defaultAddr, owner, ownerAddr } from './common';
import { binToHex, hexToBin, numberToBinUint32LE } from '@bitauth/libauth';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { binToNum } from '../utils/helpers';
import { truncate } from '../utils';

const initialSendAmountState = 1000
const initialMinerFeeState = 500


export const AgreementContract = (props) => {

    const {
      agreementContract,
      agreementContractAmount,
      agreementScriptHash,
      nextAgreementContractAddress
    } = props;

    console.log(props);

    const [ metaData, setMetaData ] = useState("Metadata:")

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
      const maxAmountPerEpoch = numberToBinUint32LE(parseInt(event.target.value))
      props.onChangeContractDetails({ ...props, maxAmountPerEpoch, stateIndex: props.stateIndex })
      setMaxAmountPerEpochState(event.target.value)
    }
  
    const [ remainingTimeState, setRemainingTimeState ] = useState(binToNum(props?.remainingTime))
    const remainingTimeInputRef = useRef<any>(null);
    const onChangeRemainingTime = (event) => {
      const remainingTime = numberToBinUint32LE(parseInt(event.target.value))
      props.onChangeContractDetails({ ...props, remainingTime, stateIndex: props.stateIndex })
      setRemainingTimeState(event.target.value)
    }
  
    const [ remainingAmountState, setRemainingAmountState ] = useState(binToNum(props?.remainingAmount))
    const remainingAmountInputRef = useRef<any>(null);
    const onChangeRemainingAmount = (event) => {
      const remainingAmount = numberToBinUint32LE(parseInt(event.target.value))
      props.onChangeContractDetails({ ...props, remainingAmount, stateIndex: props.stateIndex })
      setRemainingAmountState(event.target.value)
    }

    const [ validFromState, setValidFromState ] = useState(binToNum(props?.validFrom))
    const validFromInputRef = useRef<any>(null);
    const onChangeValidFrom = (event) => {
      const validFrom = numberToBinUint32LE(parseInt(event.target.value))
      props.onChangeContractDetails({ ...props, validFrom, stateIndex: props.stateIndex })
      setValidFromState(event.target.value)
    }

    const createNextState = () => {
      props.createNextState({
        maxAmountPerEpoch: maxAmountPerEpochState,
        remainingAmount: remainingAmountState,
        remainingTime: remainingTimeState,
        stateIndex: props.stateIndex
      })
    }
  
    const [ sendAmountState, setSendAmountState ] = useState(initialSendAmountState)
    const sendAmountInputRef = useRef<any>(null);
    const onChangeSendAmount = (event) => { setSendAmountState(event.target.value)}
  
    const [ minerFeeState, setMinerFeeState ] = useState(initialMinerFeeState)
    const minerFeeInputRef = useRef<any>(null);
    const onChangeMinerFee = (event) => { setMinerFeeState(event.target.value)}


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
      <div className="columns is-multiline pb-4">
        <div className="columns column is-full is-centered">
        <div className="box is-two-thirds column" style={{ backgroundColor: 'rgb(42, 45, 47)' }}>
  
          <div className="title has-text-white">Contract State-{props.stateIndex}</div>

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

            <div className="field pb-3" style={{ borderBottom: '2px solid rgb(30, 32, 35)'}}>
              <div className="columns">

                <div className="column">
                  <label className="label has-text-grey-lighter">Epoch</label>
                  <div className="control">
                    <input value={epochState}
                      onChange={onChangeEpoch}
                      ref={epochInputRef}
                      className="input has-text-grey-light has-background-dark"
                      style={{  }}
                      type="text"
                      placeholder="Remaining Time"
                    />
                  </div>
                </div>

                <div className="column">
                  <label className="label has-text-grey-lighter">MaxAmount/Epoch</label>
                  <div className="control">
                    <input value={maxAmountPerEpochState}
                      onChange={onChangeMaxAmountPerEpoch}
                      ref={maxAmountPerEpochInputRef}
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
                  <label className="label has-text-grey-lighter">Remaining Time</label>
                  <div className="control">
                    <input value={remainingTimeState}
                      onChange={onChangeRemainingTime}
                      ref={remainingTimeInputRef}
                      className="input has-text-grey-light has-background-dark"
                      type="text"
                      placeholder="Remaining Time"
                    />
                  </div>
                </div>

                <div className="column">
                  <label className="label has-text-grey-lighter">Remaining Amount</label>
                  <div className="control">
                    <input value={remainingAmountState}
                      onChange={onChangeRemainingAmount}
                      ref={remainingAmountInputRef}
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

          <div className="title has-text-white is-4 pt-2">{'> Spend'}</div>

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

          <div className="field">
            <label className="label has-text-grey-lighter">Metadata</label>
            <div className="control">
              <p className="content has-text-grey-light">{metaData}</p>
            </div>
          </div>
    
          <div className="columns">
            <div className="column control is-10">
              <button
                onClick={handleSubmit}
                style={{ backgroundColor: 'rgb(30, 32, 35)', borderWidth: 0 }}
                className="button has-text-white">
                  Submit Transaction
              </button>
              <button onClick={revoke} className="ml-6 button has-text-white" style={{ backgroundColor: 'rgb(30, 32, 35)', borderWidth: 0 }}>Revoke</button>
            </div>
            <div className="column has-text-right">
              <button onClick={createNextState} className="button has-text-white" style={{ backgroundColor: 'rgb(30, 32, 35)' }}>+</button>
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