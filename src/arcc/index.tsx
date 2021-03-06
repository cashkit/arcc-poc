import React from 'react';
import { numberToBinUint32LE } from '@bitauth/libauth';
import { BITBOX } from 'bitbox-sdk';
import { binToHex } from '@bitauth/libauth';
import { AgreementContract } from './agreement';
import { History } from './history';
import {
  getContractInfo,
  payerPkh,
  payeePk,
  expireAfter,
  defaultEpoch,
  defaultMaxAmountPerEpoch,
  defaultRemainingAmount,
} from './common';
import { buildLockScriptP2PKH } from '../utils/helpers';
import { deriveNextStateValues, getSpendableAmount } from '../lib';

import { hexToNum } from '../utils/helpers';
console.log(hexToNum("2202", 2 ))
console.log(hexToNum("e803000000000000", 8))

const bitbox = new BITBOX();


export class AgreementContractWrapper extends React.Component<any, any> {

  constructor(props) {
    super(props);

    this.state = {
      payeeHash: undefined,
      contracts: []
    };
  }

  componentDidMount = async () => {
    const payeeHash = await buildLockScriptP2PKH(binToHex(payeePk));
    // A manual test for a P2SH locking script
    // const payeeHash = "17a91439868d08b1575e7ae9b3c910cdec2d4ab7d067d987"
    const defaultContractState = { payeeHash }
    await this.createCurrentContractState(defaultContractState)
  }

  createCurrentContractState = async (params) => {
    const { payeeHash } = params;
    const epoch = params?.defaultEpoch || defaultEpoch
    const maxAmountPerEpoch = defaultMaxAmountPerEpoch
    const remainingAmount = defaultRemainingAmount
    const blockCount = await bitbox.Blockchain.getBlockCount()
    const validFrom = blockCount
    const expiration = validFrom + expireAfter;

    let remainingTimeNum = blockCount - validFrom;
    if (remainingTimeNum === 0) {
      remainingTimeNum = params?.defaultEpoch || defaultEpoch
    }

    const agreementContractParams = [
      payerPkh,
      payeeHash,
      numberToBinUint32LE(expiration),
      numberToBinUint32LE(epoch),
      numberToBinUint32LE(maxAmountPerEpoch),
      numberToBinUint32LE(remainingTimeNum),
      numberToBinUint32LE(remainingAmount),
      numberToBinUint32LE(validFrom)
    ]

    const res = await getContractInfo(agreementContractParams, 'Agreement.cash')

    const actualSpendableAmount = await getSpendableAmount({
      epoch: epoch,
      maxAmountPerEpoch: maxAmountPerEpoch,
      remainingAmount: remainingAmount,
      validFrom: validFrom,
      remainingTime: remainingTimeNum
    })

    const currentContract = {
        payerPkh,
        payeeHash,
        expiration,
        epoch,
        maxAmountPerEpoch,
        remainingTime: remainingTimeNum,
        remainingAmount,
        validFrom,
        actualSpendableAmount,
        agreementContract: res[0],
        agreementContractAmount: res[1],
        agreementScriptHash: res[2]
    }

    const newContractState = this.state.contracts;
    newContractState.unshift(currentContract);

    this.setState((prevState) => ({
      contracts: [...newContractState],
      payeeHash: payeeHash
    }))
  }

  createNextState = async (params) => {
    const { contracts, payeeHash } = this.state;
    const nextState = params.stateIndex;

    const agreementContractParams = [
      payerPkh,
      payeeHash,
      numberToBinUint32LE(params.expiration),
      numberToBinUint32LE(params.epoch),
      numberToBinUint32LE(params.maxAmountPerEpoch),
      numberToBinUint32LE(params.remainingTime),
      numberToBinUint32LE(params.remainingAmount),
      numberToBinUint32LE(params.validFrom)
    ]

    const res = await getContractInfo(agreementContractParams, 'Agreement.cash')
    
    const actualSpendableAmount = await getSpendableAmount({
      epoch: params.epoch,
      maxAmountPerEpoch: params.maxAmountPerEpoch,
      remainingAmount: params.remainingAmount,
      validFrom: params.validFrom,
      remainingTime: params.remainingTime
    })

    const nextContract = {
      payerPkh,
      payeeHash,
      epoch: params.epoch,
      expiration: params.expiration,
      maxAmountPerEpoch: params.maxAmountPerEpoch,
      remainingTime: params.remainingTime,
      remainingAmount: params.remainingAmount,
      validFrom: params.validFrom,
      actualSpendableAmount,
      agreementContract: res[0],
      agreementContractAmount: res[1],
      agreementScriptHash: res[2]
    }

    contracts.splice(nextState, 1);
    contracts.splice(nextState, 0, nextContract);
    contracts.splice(nextState + 2, contracts.length - (nextState + 1));

    this.setState(() => ({
      contracts: [...contracts]
    }))
  }

  /**
   * Re-create the state of the current contract when this method is called.
   * Update the state of next contract as well.
   * Remove all contract after the next contract state is derived.
   */
  onChangeContractDetails = async (params) => {
    const { payeeHash } = this.state;
    const stateIndex = params.stateIndex;
    const agreementContractParams = [
      payerPkh,
      payeeHash,
      numberToBinUint32LE(params.expiration),
      numberToBinUint32LE(params.epoch),
      numberToBinUint32LE(params.maxAmountPerEpoch),
      numberToBinUint32LE(params.remainingTime),
      numberToBinUint32LE(params.remainingAmount),
      numberToBinUint32LE(params.validFrom)
    ]

    const currentAgreementRes = await getContractInfo(agreementContractParams, 'Agreement.cash');

    const { contracts } = this.state;
    let currentContract = contracts[stateIndex];

    const actualSpendableAmount = await getSpendableAmount({
      epoch: params.epoch,
      maxAmountPerEpoch: params.maxAmountPerEpoch,
      remainingAmount: params.remainingAmount,
      validFrom: params.validFrom,
      remainingTime: params.remainingTime
    })

    currentContract = {
      payerPkh,
      payeeHash,
      epoch: params.epoch,
      expiration: params.expiration,
      maxAmountPerEpoch: params.maxAmountPerEpoch,
      remainingTime: params.remainingTime,
      remainingAmount: params.remainingAmount,
      validFrom: params.validFrom,
      actualSpendableAmount,
      agreementContract: currentAgreementRes[0],
      agreementContractAmount: currentAgreementRes[1],
      agreementScriptHash: currentAgreementRes[2]
    }
    contracts.splice(stateIndex, 1);
    contracts.splice(stateIndex, 0, currentContract);
    contracts.splice(stateIndex + 2, contracts.length - (stateIndex + 1));

    if (contracts[stateIndex+1]){

      const nextState = await deriveNextStateValues({
        epoch: params.epoch,
        maxAmountPerEpoch: params.maxAmountPerEpoch,
        remainingAmount: params.remainingAmount,
        validFrom: params.validFrom,
        remainingTime: params.remainingTime,
        amount: params.amount
      })

      const nextStateActualSpendableAmount = await getSpendableAmount({
        epoch: params.epoch,
        maxAmountPerEpoch: params.maxAmountPerEpoch,
        remainingAmount: nextState.remainingAmount,
        validFrom: nextState.validFrom,
        remainingTime: nextState.remainingTime
      })

      const nextAgreementContractParams = [
        payerPkh,
        payeeHash,
        numberToBinUint32LE(params.expiration),
        numberToBinUint32LE(params.epoch),
        numberToBinUint32LE(params.maxAmountPerEpoch),
        numberToBinUint32LE(nextState.remainingTime),
        numberToBinUint32LE(nextState.remainingAmount),
        numberToBinUint32LE(nextState.validFrom)
      ]

      const nextAgreementRes = await getContractInfo(nextAgreementContractParams, 'Agreement.cash');

      let nextStateContract = contracts[stateIndex+1];
      nextStateContract = {
        ...currentContract,
        remainingAmount: nextState.remainingAmount,
        remainingTime: nextState.remainingTime,
        validFrom: nextState.validFrom,
        actualSpendableAmount: nextStateActualSpendableAmount,
        agreementContract: nextAgreementRes[0],
        agreementContractAmount: nextAgreementRes[1],
        agreementScriptHash: nextAgreementRes[2]
      }
      contracts[stateIndex+1] = nextStateContract
    }

    this.setState(() => ({
      contracts: [...contracts]
    }))
  }

  renderContracts = () => {
    const { contracts } = this.state;
    return contracts.map((contract, index) => {
      let nextAgreementContractAddress;
      if (contracts[index +1]){
        nextAgreementContractAddress = contracts[index + 1]?.agreementContract?.address
      }
      
      return (
        <AgreementContract
          key={index}
          stateIndex={index}
          nextAgreementContractAddress={nextAgreementContractAddress}
          onChangeContractDetails={this.onChangeContractDetails}
          createNextState={this.createNextState}
          {...contract}>
        </AgreementContract>
      )
    })
  }

  render() {
      return (
        <div className="columns is-full is-centered">
          <div className="is-8 column">
            {this.renderContracts()}
          </div>
          <div className="is-3 column">
            <History
              createCurrentContractState={this.createCurrentContractState}>
            </History>
          </div>
        </div>
      )
  }
}
