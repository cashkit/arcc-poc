import React from 'react';
import { SignatureTemplate } from 'cashscript';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import LoadingOverlay from 'react-loading-overlay';

import { InfoComponent } from './info';
import { HoverableHeading, HoverableSubHeading } from './hoverable';

import {
  defaultAddr,
  dust,
  initialMinerFeeState,
  initialRevokeMinerFeeState,
  initialSendAmountState,
  MESSAGES,
  payee,
  payer,
  payeeAddr,
  payerAddr,
  deriveNextStateValues } from './common';
import '../App.css'

import { BITBOX } from 'bitbox-sdk';
const bitbox = new BITBOX();


export class AgreementContract extends React.Component<any, any> {
  epochInputRef
  remainingTimeInputRef
  sendAmountInputRef
  remainingAmountSpendableRef
  minerFeeInputRef
  revokeMinerFeeInputRef
  validFromInputRef
  maxAmountPerEpochInputRef

  constructor(props) {
    super(props);

    this.epochInputRef = React.createRef();
    this.remainingTimeInputRef = React.createRef();
    this.sendAmountInputRef = React.createRef();
    this.minerFeeInputRef = React.createRef();
    this.revokeMinerFeeInputRef = React.createRef();
    this.validFromInputRef = React.createRef();
    this.maxAmountPerEpochInputRef = React.createRef();
    this.remainingAmountSpendableRef = React.createRef();

    this.state = {
      isLoading: false,
      metaData: '',
      errorMessage: '',
      displayNewSpendableAmountInfo: false,
      currentBlockHeight: undefined,
      sendAmountState: props?.initialSendAmountState || initialSendAmountState,
      minerFeeState: props?.initialMinerFeeState || initialMinerFeeState,
      revokeMinerFeeState: props?.initialRevokeMinerFeeState || initialRevokeMinerFeeState,
      epochState: props?.epoch,
      remainingAmountState: props?.remainingAmount - initialSendAmountState,
      maxAmountPerEpochState: props?.maxAmountPerEpoch,
      remainingTimeState: props?.remainingTime,
      validFromState: props?.validFrom,
    };
  }

  componentDidMount = async () => {
    const blockCount = await bitbox.Blockchain.getBlockCount()
    this.setState({ currentBlockHeight: blockCount })
  }

  componentDidUpdate = async (prevProps, prevState, snapshot) => {
    // const blockCount = await bitbox.Blockchain.getBlockCount()
    // const passedTime = blockCount - prevProps?.validFrom
    // if (passedTime >= prevProps?.remainingTime && prevProps.stateIndex !== 0){
    //   console.log("New spendable amount is mac")
    //   this.setState({ displayNewSpendableAmountInfo: true })
    // }

    if (prevState.isLoading){
      this.setState({ isLoading: false })
    }
  }

  static getDerivedStateFromProps(props, state){
    return {
      isLoading: state.isLoading,
      metaData: state.metaData,
      errorMessage: state.errorMessage,
      sendAmountState: state.sendAmountState,
      minerFeeState: state.minerFeeState,
      revokeMinerFeeState: state.revokeMinerFeeState,
      epochState: props?.epoch,
      remainingAmountState: props?.remainingAmount,
      maxAmountPerEpochState: props?.maxAmountPerEpoch,
      remainingTimeState: props?.remainingTime,
      validFromState: props?.validFrom
    }
  }

  onChangeEpoch = (event) => {
    let epochNum = parseInt(event.target.value)

    if (isNaN(epochNum)){
      epochNum = 0
    }
    
    this.setState({ isLoading: true }, () => {
      this.props.onChangeContractDetails({ ...this.props, amount: this.state.sendAmountState, epoch: epochNum, stateIndex: this.props.stateIndex })
    })
    
  }

  onChangeMaxAmountPerEpoch = (event) => {
    let maxAmountPerEpochNum = parseInt(event.target.value)
    if (isNaN(maxAmountPerEpochNum)){
      maxAmountPerEpochNum = 0
    }

    if (maxAmountPerEpochNum < dust) {
      this.setState({ errorMessage: MESSAGES.MAX_AMOUNT_PER_EPOCH_TOO_LOW })
    }
    const maxAmountPerEpoch = maxAmountPerEpochNum
    this.setState({ isLoading: true }, () => {
      this.props.onChangeContractDetails({ ...this.props, amount: this.state.sendAmountState, maxAmountPerEpoch, stateIndex: this.props.stateIndex })
    })
  }

  onChangeRemainingTime = (event) => {
    let remainingTimeNum = parseInt(event.target.value)

    if (isNaN(remainingTimeNum)){
      remainingTimeNum = 0
    }

    const remainingTime = remainingTimeNum
    this.setState({ isLoading: true }, () => {
      this.props.onChangeContractDetails({ ...this.props, amount: this.state.sendAmountState, remainingTime, stateIndex: this.props.stateIndex })
    })
  }

  onChangeValidFrom = (event) => {
    let validFromNum = parseInt(event.target.value)
    if (isNaN(validFromNum)){
      validFromNum = 0
    }

    if (validFromNum < 1) {
      this.setState({ errorMessage: MESSAGES.EPOCH_TOO_LOW })
    }

    const validFrom = validFromNum
    this.setState({ isLoading: true }, () => {
      this.props.onChangeContractDetails({ ...this.props, amount: this.state.sendAmountState, validFrom, stateIndex: this.props.stateIndex })
    })
  }

  onChangeRemainingAmountSpendable = (event) => {
    let remainingAmountNum = parseInt(event.target.value)
    if (isNaN(remainingAmountNum)){
      remainingAmountNum = 0
    }
    const remainingAmount = remainingAmountNum
    let errorMessage: any = undefined

    if (remainingAmountNum > this.props.maxAmountPerEpoch) {
      errorMessage = MESSAGES.REMAINING_AMOUNT_HIGH
    }

    this.setState({ isLoading: true, errorMessage }, () => {
      this.props.onChangeContractDetails({ ...this.props, amount: this.state.sendAmountState, remainingAmount, stateIndex: this.props.stateIndex })
    })
  }

  onChangeSendAmount = (event) => {
    const remainingAmountFromProps = this.props?.remainingAmount

    let newSendAmount = parseInt(event.target.value)

    if (isNaN(newSendAmount)){
      newSendAmount = 0
    }

    let errorMessage: any = undefined
    if (newSendAmount < dust) {
      errorMessage = MESSAGES.SPEND_AMOUNT_TOO_LOW
    }
    if (newSendAmount > remainingAmountFromProps) {
      errorMessage = `Spending amount should be less than ${remainingAmountFromProps}`
    }

    this.setState({ errorMessage, isLoading: true, sendAmountState: newSendAmount }, () => {
      this.createNextState({ remainingAmount: remainingAmountFromProps - newSendAmount })
    })
    
  }

  onChangeMinerFee = (event) => {
    let minerFeeStateInt = parseInt(event.target.value)

    if (isNaN(minerFeeStateInt)){
      minerFeeStateInt = 0
    }

    this.setState({ minerFeeState: minerFeeStateInt })
  }

  onChangeRevokeMinerFee = (event) => {
    let revokeMinerFeeint = parseInt(event.target.value)

    if (isNaN(revokeMinerFeeint)){
      revokeMinerFeeint = 0
    }

    this.setState({ revokeMinerFeeState: revokeMinerFeeint })
  }

  /**
   * Used to derive the next contract state from the current state. 
   *
   */
  createNextState = async (param = {}) => {
    const { sendAmountState } = this.state;
    const {
      epoch,
      maxAmountPerEpoch,
      remainingTime,
      remainingAmount,
      validFrom,
      payerPk,
      payeePk } = this.props;
    
    const nextState = await deriveNextStateValues({
      epoch,
      maxAmountPerEpoch,
      remainingAmount,
      validFrom,
      remainingTime,
      amount: sendAmountState
    })

    let nextContractProps = {
      payerPk,
      payeePk,
      epoch,
      maxAmountPerEpoch,
      remainingTime: nextState.remainingTime,
      remainingAmount: nextState.remainingAmount,
      validFrom: nextState.validFrom,
      stateIndex: this.props.stateIndex + 1
    }

    if (Object.keys(param).length > 0) {
      nextContractProps = { ...nextContractProps, ...param }
    }
    this.props.createNextState(nextContractProps)
  }  

  submitRevokeTransaction = async () => {
    const { agreementContractAmount, agreementContract } = this.props;
    const { revokeMinerFeeState } = this.state;

    const change = agreementContractAmount - revokeMinerFeeState

    this.setState({ metaData: `Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${revokeMinerFeeState} change: ${change}`})

    if (change < dust){
      this.setState({ errorMessage: MESSAGES.REVOKE_AMOUNT_TOO_LOW })
      return
    }

    const tx = await agreementContract.functions
    .revoke(new SignatureTemplate(payer))
    .withHardcodedFee(revokeMinerFeeState)
    .to(defaultAddr, change)
    // .build()
    .send()

    this.saveExecutedContractState({ type: 'revoke' })

    console.log(tx)
    console.log(JSON.stringify(tx))
  }

  submitSpendTransaction = async () => {
    const { sendAmountState, minerFeeState } = this.state;
    const { agreementContractAmount, nextAgreementContractAddress, agreementContract } = this.props;

    const sendAmount = parseInt(sendAmountState);
    const minerFee = parseInt(minerFeeState);
    const iAgreementContractAmount = parseInt(agreementContractAmount);
    const amountToNextState = iAgreementContractAmount - minerFeeState - sendAmountState;

    this.setState({ metaData: `Values in sats: Input agreementContractAmount: ${agreementContractAmount}, Miner Fee: ${minerFeeState} sendAmount: ${sendAmountState} amountToNextState: ${amountToNextState}`})

    if (!nextAgreementContractAddress){
      this.setState({ errorMessage: MESSAGES.NEXT_STATE_NOT_DERIVE })
      return
    }

    if (amountToNextState < dust) {
      this.setState({ errorMessage: MESSAGES.NEXT_STATE_AMOUNT_TOO_LOW })
      return
    }

    if (sendAmount < dust) {
      this.setState({ errorMessage: MESSAGES.SPEND_AMOUNT_TOO_LOW })
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

    this.saveExecutedContractState({ type: 'spend' })

    console.log(aggrementTx)
    console.log(JSON.stringify(aggrementTx))
  }

  saveExecutedContractState = async ({ type }) => {
    const { agreementContract, nextAgreementContractAddress, agreementContractAmount } = this.props;
    const {
      sendAmountState,
      minerFeeState,
      revokeMinerFeeState,
      validFromState,
      maxAmountPerEpochState,
      remainingTimeState,
      epochState,
      remainingAmountState } = this.state;

    const res = await localStorage.getItem('executed_contracts');
    let prevContracts: any = []
    if (res) {
      prevContracts = JSON.parse(res)
    }

    const balance = parseInt(agreementContractAmount);
    let amountToNextState = balance - minerFeeState - sendAmountState;

    if (type === 'revoke'){
      amountToNextState = balance - revokeMinerFeeState;
    }

    let newExecutedContract = {
      type,
      time: new Date(),
      agreementContractAmount: balance,
      amountToNextState,
      agreementContractAddress: agreementContract?.address,
      epochState,
      nextAgreementContractAddress,
      sendAmountState,
      maxAmountPerEpochState,
      remainingTimeState,
      remainingAmountState,
      minerFeeState,
      validFromState,
    }

    prevContracts.unshift(newExecutedContract)

    await localStorage.setItem('executed_contracts', JSON.stringify(prevContracts));
  }

  renderHeaderDetails = () => {
    const {
      agreementContract,
      agreementContractAmount,
      stateIndex} = this.props;
    return (
      <>
        <div className="columns">
          <div className="title has-text-white pl-3 pt-3">Contract State-{stateIndex}</div>
          <div className="column has-text-right">
            <InfoComponent/>
          </div>
        </div>
        
        <div className="mb-2 pb-3" style={{ borderBottom: '3px solid rgb(30, 32, 35)' }}>
          <label className="label has-text-grey-lighter">{agreementContract?.address}
            <a target='_' href={`https://explorer.bitcoin.com/bch/address/${agreementContract?.address}`}>
              <FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
            </a>
          </label>
          <div className="control has-text-grey-lighter">
              Balance: {agreementContractAmount}
          </div>
        </div>
      </>
    )
  }

  renderConstructorDetails = () => {
    return (
      <>
      <div className="title has-text-white is-4 pt-2">{'> Constructor'}</div>
        {/* <div className="columns column mb-0 pb-0">
          <label className="label has-text-grey-lighter pr-3">PayerPk</label>
          <div className="control has-text-grey-light">
            0x{binToHex(payerPk)}
          </div>
        </div>

        <div className="columns column mb-0 pb-1">
          <label className="label has-text-grey-lighter pr-3">PayeePk</label>
          <div className="control has-text-grey-light">
            0x{binToHex(payeePk)}
          </div>
        </div> */}

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
      </>
    )
  }

  renderInputParams = () => {

    return (
      <div className="field pb-3 pt-3" style={{ borderBottom: '2px solid rgb(30, 32, 35)'}}>
        <div className="columns">

          <div className="column">
            <div className="columns pl-3">
              <HoverableSubHeading
                title={MESSAGES.HOVERABLE_EPOCH_TITLE}
                info={MESSAGES.HOVERABLE_EPOCH_INFO}
              />
            </div>
            <div className="control">
              <input
                value={this.props?.epoch}
                onChange={this.onChangeEpoch}
                disabled={this.props.stateIndex !== 0}
                ref={this.epochInputRef}
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
                title={MESSAGES.HOVERABLE_MAX_AMOUNT_PER_EPOCH_TITLE}
                info={MESSAGES.HOVERABLE_MAX_AMOUNT_PER_EPOCH_INFO}
              />
            </div>
            <div className="control">
              <input
                value={this.props?.maxAmountPerEpoch}
                onChange={this.onChangeMaxAmountPerEpoch}
                disabled={this.props.stateIndex !== 0}
                ref={this.maxAmountPerEpochInputRef}
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
                title={MESSAGES.HOVERABLE_REMAINING_TIME_TITLE}
                info={MESSAGES.HOVERABLE_REMAINING_TIME_INFO}
              />
            </div>
            <div className="control">
              <input
                value={this.props?.remainingTime}
                onChange={this.onChangeRemainingTime}
                disabled={this.props.stateIndex !== 0}
                ref={this.remainingTimeInputRef}
                className="input has-text-grey-light has-background-dark"
                type="text"
                placeholder="Remaining Time"
              />
            </div>
          </div>

          <div className="column">
            <div className="columns pl-3">
            <HoverableSubHeading
              title={MESSAGES.HOVERABLE_REMAINING_SPENDABLE_AMOUNT_TITLE}
              info={MESSAGES.HOVERABLE_REMAINING_SPENDABLE_AMOUNT_INFO}
            />
            </div>
            <div className="control">
              <input
                value={this.props?.remainingAmount}
                onChange={this.onChangeRemainingAmountSpendable}
                disabled={this.props.stateIndex !== 0}
                ref={this.remainingAmountSpendableRef}
                className="input has-text-grey-light has-background-dark"
                type="text"
                placeholder="Remaining Amount"
              />
            </div>
          </div>
        </div>

        <div className="columns column pl-0">
          <div className="column">
            <label className="label has-text-grey-lighter">Valid From</label>
            <div className="control">
              <input
                value={this.props?.validFrom}
                onChange={this.onChangeValidFrom}
                ref={this.validFromInputRef}
                className="input has-text-grey-light has-background-dark"
                type="text"
                placeholder="Valid From"
              />
            </div>
          </div>

          <div className="column">
            <label className="label has-text-grey-lighter">Next State's validFrom</label>
            <div className="control has-text-grey-lighter">
              {this.state.currentBlockHeight}
            </div>
          </div>

          <div className="column">
            <label className="label has-text-grey-lighter">Current Block Height</label>
            <div className="control has-text-grey-lighter">
              {this.state.currentBlockHeight}
            </div>
          </div>

          
        </div>
      </div>
    )
  }

  renderSpendDetails = () => {
    const {
      sendAmountState,
      minerFeeState } = this.state;

    const { agreementContractAmount } = this.props;
    return (
      <div className="column" style={{ borderBottom: '3px solid rgb(30, 32, 35)' }}>
        <div className="columns is-4 mt-2 pl-3">
          <HoverableHeading
            title={MESSAGES.HOVERABLE_SPEND_TITLE}
            info={MESSAGES.HOVERABLE_SPEND_INFO}
          />
        </div>

        <div className="columns">
          <div className="column">
            <label className="label has-text-grey-lighter">Amount</label>
            <div className="control">
              <input value={sendAmountState}
                onChange={this.onChangeSendAmount}
                ref={this.sendAmountInputRef}
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
                onChange={this.onChangeMinerFee}
                ref={this.minerFeeInputRef}
                className="input has-text-grey-light has-background-dark"
                type="text"
                placeholder="Miner Fee"
              />
            </div>
          </div>
          
        </div>
        
        <div>
          <label className="label has-text-grey-lighter">Amount To Next State</label>
          <div className="control has-text-grey-lighter">
              Balance({agreementContractAmount}) - amount({sendAmountState}) - minerFee({minerFeeState}) = {agreementContractAmount - sendAmountState - minerFeeState}
          </div>
        </div>

        <button
          onClick={this.submitSpendTransaction}
          style={{ backgroundColor: 'rgb(30, 32, 35)', borderWidth: 0 }}
          className="button has-text-white mt-5">
            Submit Transaction
        </button>

        
      </div>
    )
  }

  renderRevokeDetails = () => {
    const { revokeMinerFeeState } = this.state;
    const { agreementContractAmount } = this.props;

    return (
      <div className="column" style={{ borderBottom: '3px solid rgb(30, 32, 35)' }}>
        <div className="columns is-4 mt-2">
          <HoverableHeading
            title={MESSAGES.HOVERABLE_REVOKE_TITLE}
            info={MESSAGES.HOVERABLE_REVOKE_INFO}
          />
        </div>
        <div className="columns">
          <div className="column">
            <label className="label has-text-grey-lighter">Miner Fee</label>
            <div className="control">
              <input value={revokeMinerFeeState}
                onChange={this.onChangeRevokeMinerFee}
                ref={this.revokeMinerFeeInputRef}
                className="input has-text-grey-light has-background-dark"
                type="text"
                placeholder="Miner Fee"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label has-text-grey-lighter">Amount To Payer</label>
          <div className="control has-text-grey-lighter">
              Balance({agreementContractAmount}) - minerFee({revokeMinerFeeState}) = {agreementContractAmount - revokeMinerFeeState}
          </div>
        </div>

        <button
          onClick={this.submitRevokeTransaction}
          className="button has-text-white mt-5"
          style={{ backgroundColor: 'rgb(30, 32, 35)', borderWidth: 0 }}>
            Revoke
        </button>
     </div>
    )
  }

  renderMeta = () => {
    const {
      metaData,
      errorMessage } = this.state;

    const { nextAgreementContractAddress } = this.props;

    return (
      <>
        
        <div className="columns">
          <div className="field column">
            <HoverableSubHeading
                title={MESSAGES.HOVERABLE_NEXT_STATE_TITLE}
                info={MESSAGES.HOVERABLE_NEXT_STATE_INFO}
              />
            <div className="control">
              Address
              <p className="content has-text-grey-light"> {nextAgreementContractAddress}</p>
            </div>
          </div>

          <div className="column has-text-right">
            <button onClick={this.createNextState} className="button has-text-white" style={{ backgroundColor: 'rgb(30, 32, 35)' }}>Derive Next State </button>
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
      </>
    )
  }

  render(){
    const { isLoading } = this.state;
    return (
      <div className="columns is-multiline pb-4">
        <div className="columns column is-full is-centered">
          <div className="box column" style={{ backgroundColor: 'rgb(42, 45, 47)' }}>
            {this.renderHeaderDetails()}
            <LoadingOverlay
              active={isLoading}
              fadeSpeed={0}
              spinner
              styles={{
                overlay: (base) => ({
                  ...base,
                  background: 'rgba(42, 45, 47, 0.7)'
                })
              }}
              text='Re-creating contract(s)'
            >
            <div className="mr-2">
              {this.renderConstructorDetails()}
              {this.renderInputParams()}
            </div>
            <div className="columns"> 
              {this.renderSpendDetails()}
              {this.renderRevokeDetails()}
            </div>
            {this.renderMeta()}
            </LoadingOverlay>
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
}