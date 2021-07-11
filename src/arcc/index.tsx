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
      contracts: [],
      epoch: numberToBinUint32LE(6),
      maxAmountPerEpoch: numberToBinUint32LE(3000)
    };
  }

  componentDidMount = async () => {
    // @ts-ignore
    const { epoch, maxAmountPerEpoch } = this.state;

    const remainingTime = numberToBinUint32LE(6)
    const remainingAmount = numberToBinUint32LE(3000)
    const blockCount = await bitbox.Blockchain.getBlockCount()
    const validFrom = numberToBinUint32LE(blockCount)

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
        contracts: newContractState
      }))
    }).catch((e) => {
      console.log(e)
    })
    // const n2b = numberToBinUint32LE(695440)
    // const b2h = binToHex(n2b)
    // console.log(b2h)
    // const h2b = hexToBin(b2h)
    // console.log(h2b)
    // console.log(hexToNum('1039', 2, false))
    // console.log(hexToNum('2202', 2))
    console.log(hexToNum('649d0a00'))
  }

  createNextState = async (params) => {
    // @ts-ignore
    const { epoch, maxAmountPerEpoch } = this.state; 
    const nextState = params.stateIndex + 1;
    const remainingAmountNum = params.maxAmountPerEpoch - params.remainingAmount
    const blockCountNum = await bitbox.Blockchain.getBlockCount()
    const remainingTimeNum = blockCountNum - params.remainingTime

    const remainingTime = numberToBinUint32LE(remainingTimeNum)
    const remainingAmount = numberToBinUint32LE(remainingAmountNum)
    const validFrom = numberToBinUint32LE(blockCountNum)

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
      // @ts-ignore
      const { contracts } = this.state;
      
      const nextContract = {
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

      contracts.splice(nextState, 1);
      contracts.splice(nextState, 0, nextContract);

      console.log(contracts)

      // @ts-ignore
      this.setState(() => ({
        contracts: contracts
      }))
    }).catch((e) => {
      console.log(e)
    })
  }

  onChangeContractDetails = (params) => {
    // @ts-ignore
    const { epoch, maxAmountPerEpoch } = this.state;
    const stateIndex = params.stateIndex;
    const agreementContractParams = [
      payerPk,
      payeePk,
      epoch,
      maxAmountPerEpoch,
      params.remainingTime,
      params.remainingAmount,
      params.validFrom
    ]

    getContractInfo(agreementContractParams, 'Agreement.cash').then((res) => {
      // @ts-ignore
      const { contracts } = this.state;
      let currentContract = contracts[stateIndex];
      currentContract = {
        ...currentContract,
        agreementContract: res[0],
        agreementContractAmount: res[1],
        agreementScriptHash: res[2]
      }
      contracts.splice(stateIndex, 1);
      contracts.splice(stateIndex, 0, currentContract);
      contracts.splice(stateIndex + 2, contracts.length - (stateIndex + 1));

      // @ts-ignore
      this.setState(() => ({
        contracts: contracts
      }))
    }).catch((e) => {
      console.log(e)
    })
  }

  renderContracts = () => {
    // @ts-ignore
    const { contracts } = this.state;
    // @ts-ignore
    return contracts.map((contract, index) => {
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
