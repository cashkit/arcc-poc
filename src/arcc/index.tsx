import React from 'react';
import { binToHex, hexToBin, numberToBinUint32LE } from '@bitauth/libauth';
import { hexToNum } from '../utils/helpers';
import { AgreementContract } from './agreement';
import {
  getContractInfo,
  payerPk,
  payeePk,
} from './common';
import { BITBOX } from 'bitbox-sdk';

const bitbox = new BITBOX();


export class AgreementContractWrapper extends React.Component<any, any> {

  constructor(props) {
    super(props);

    // @ts-ignore
    this.state = {
      contracts: []
    };
  }

  componentDidMount = async () => {
    const epochNum = 1
    const epoch = numberToBinUint32LE(epochNum)
    const maxAmountPerEpoch = numberToBinUint32LE(3000)
    const remainingAmount = numberToBinUint32LE(3000)
    const blockCount = await bitbox.Blockchain.getBlockCount()
    const validFromNum = blockCount
    const validFrom = numberToBinUint32LE(blockCount)

    const remainingTimeNum = blockCount - validFromNum;
    const remainingTime = numberToBinUint32LE(remainingTimeNum);

    const agreementContractParams = [
        payerPk,
        payeePk,
        epoch,
        maxAmountPerEpoch,
        remainingTime,
        remainingAmount,
        validFrom
    ]

    getContractInfo(agreementContractParams, 'Agreement.cash').then((res) => {
      const currentContract = {
        payerPk,
        payeePk,
        epoch,
        maxAmountPerEpoch,
        remainingTime,
        remainingAmount,
        validFrom,
        agreementContract: res[0],
        agreementContractAmount: res[1],
        agreementScriptHash: res[2]
      }
      // @ts-ignore
      const newContractState = this.state.contracts;
      newContractState.unshift(currentContract);
      // @ts-ignore
      this.setState((prevState) => ({
        contracts: [...newContractState]
      }))

    }).catch((e) => {
      console.log(e)
    })

    // console.log(hexToNum('649d0a00'))
  }

  createNextState = async (params) => {
    // @ts-ignore
    const nextState = params.stateIndex;
    const blockCountNum = await bitbox.Blockchain.getBlockCount()
    const remainingTimeNum = (blockCountNum - parseInt(params.validFrom)) % parseInt(params.epoch)
    const remainingTime = numberToBinUint32LE(remainingTimeNum)
    const validFrom = numberToBinUint32LE(blockCountNum)

    const agreementContractParams = [
      params.payerPk,
      params.payeePk,
      params.epoch,
      params.maxAmountPerEpoch,
      remainingTime,
      params.remainingAmount,
      validFrom
    ]

    getContractInfo(agreementContractParams, 'Agreement.cash').then((res) => {
      // @ts-ignore
      const { contracts } = this.state;
      
      const nextContract = {
        payerPk,
        payeePk,
        epoch: params.epoch,
        maxAmountPerEpoch: params.maxAmountPerEpoch,
        remainingTime,
        remainingAmount: params.remainingAmount,
        validFrom,
        agreementContract: res[0],
        agreementContractAmount: res[1],
        agreementScriptHash: res[2]
      }

      contracts.splice(nextState, 1);
      contracts.splice(nextState, 0, nextContract);
      contracts.splice(nextState + 2, contracts.length - (nextState + 1));

      console.log(contracts)

      // @ts-ignore
      this.setState(() => ({
        contracts: [...contracts]
      }), () => {console.log("Updatin?")})
    }).catch((e) => {
      console.log(e)
    })
  }

  onChangeContractDetails = async (params) => {
    console.log(params)
    // @ts-ignore
    const stateIndex = params.stateIndex;
    const agreementContractParams = [
      params.payerPk,
      params.payeePk,
      params.epoch,
      params.maxAmountPerEpoch,
      params.remainingTime,
      params.remainingAmount,
      params.validFrom
    ]

    const currentAgreementRes = await getContractInfo(agreementContractParams, 'Agreement.cash');

    getContractInfo(agreementContractParams, 'Agreement.cash')
    // @ts-ignore
    const { contracts } = this.state;
    let currentContract = contracts[stateIndex];
    currentContract = {
      payerPk: params.payerPk,
      payeePk: params.payeePk,
      epoch: params.epoch,
      maxAmountPerEpoch: params.maxAmountPerEpoch,
      remainingTime: params.remainingTime,
      remainingAmount: params.remainingAmount,
      validFrom: params.validFrom,
      agreementContract: currentAgreementRes[0],
      agreementContractAmount: currentAgreementRes[1],
      agreementScriptHash: currentAgreementRes[2]
    }
    contracts.splice(stateIndex, 1);
    contracts.splice(stateIndex, 0, currentContract);
    contracts.splice(stateIndex + 2, contracts.length - (stateIndex + 1));

    if (contracts[stateIndex+1]){
      const nextAgreementRes = await getContractInfo(agreementContractParams, 'Agreement.cash');

      let nextStateContract = contracts[stateIndex+1];
      const blockCountNum = await bitbox.Blockchain.getBlockCount()
      const validFrom = numberToBinUint32LE(blockCountNum)
      const remainingTimeNum = (blockCountNum - parseInt(params.validFrom)) % parseInt(params.epoch)
      const remainingTime = numberToBinUint32LE(remainingTimeNum)

      nextStateContract = {
        ...currentContract,
        remainingTime,
        validFrom,
        agreementContract: nextAgreementRes[0],
        agreementContractAmount: nextAgreementRes[1],
        agreementScriptHash: nextAgreementRes[2]
      }
      contracts[stateIndex+1] = nextStateContract
    }

    console.log(contracts)
    // @ts-ignore
    this.setState(() => ({
      contracts: [...contracts]
    }))
  }

  renderContracts = () => {
    // @ts-ignore
    const { contracts } = this.state;
    return contracts.map((contract, index) => {
      console.log("Rerendering both", contract)
      return (
        <AgreementContract
          key={index}
          stateIndex={index}
          onChangeContractDetails={this.onChangeContractDetails}
          createNextState={this.createNextState}
          {...contract}>
        </AgreementContract>
      )
    })
  }

  render() {
      return (
        <>
          {this.renderContracts()}
        </>
      )
  }
}
