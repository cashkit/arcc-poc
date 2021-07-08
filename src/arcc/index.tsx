import React from 'react';
import { binToHex, binToNumberUint32LE, hexToBin, numberToBinUint32BE, numberToBinUint32LE } from '@bitauth/libauth';
import { hexToNum } from '../utils/helpers';
import { OwnerContract } from './payer';
import { AgreementContract } from './agreement';
import {
  initialAmount,
  getContractInfo,
  ownerPk,
  payerPk,
  payeePk,
  deadline,
  maxAmountPerEpoch,
  epoch,
  remainingAmount,
  validFrom,
  newContractValidFrom
} from './common';


export class AgreementContractWrapper extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
    // @ts-ignore
    this.state = {
      agreementContract: undefined, agreementContractAmount: undefined, agreementScriptHash: undefined,
      nextAgreementContract: undefined, nextAgreementContractAmount: undefined, nextAgreementScriptHash: undefined
    };
  }
  
  componentDidMount = () => {
    // @ts-ignore
    const { payerContractScriptHash } = this.props;
    if ( payerContractScriptHash ) {
      const agreementContractParams = [
          payerPk,
          // payerContractScriptHash,
          payeePk,
          // deadline,
          maxAmountPerEpoch,
          epoch,
          remainingAmount,
          validFrom
      ]

      getContractInfo(agreementContractParams, 'Agreement.cash').then((res) => {
        console.log(res)
        // @ts-ignore
        this.setState({ agreementContract: res[0], agreementContractAmount: res[1], agreementScriptHash: res[2] })
      }).catch((e) => {
        console.log(e)
      })

      const minerFee = 1216 // Close to min relay fee of the network.
      const sendAmount = 1000;
      // 3000 is the previous contract's input value.
      // const contractAmount = 3000 - minerFee - sendAmount;
      const contractAmount = 3000 - sendAmount;

      const nextContractAddress = '' 
      let nextContractRemainingAmount;
      const isNewEpoch = false;
      if (isNewEpoch) {
        nextContractRemainingAmount = contractAmount
      } else {
        nextContractRemainingAmount = initialAmount - sendAmount
      }

      console.log("nextContractRemainingAmount: ", nextContractRemainingAmount)

      const n2b = numberToBinUint32LE(nextContractRemainingAmount)
      console.log(binToHex(n2b))
      //console.log(hexToNum('1039', 2, false))
      console.log(hexToNum('0984e660'))

      const nextAgreementContractParams = [
        payerPk,
        // payerContractScriptHash,
        payeePk,
        // deadline,
        maxAmountPerEpoch,
        epoch,
        // numberToBinUint32LE(3000),
        remainingAmount,
        // validFrom
        newContractValidFrom
    ]

    getContractInfo(nextAgreementContractParams, 'Agreement.cash').then((res) => {
      console.log(res)
      // @ts-ignore
      this.setState({ nextAgreementContract: res[0], nextAgreementContractAmount: res[1], nextAgreementScriptHash: res[2] })
    }).catch((e) => {
      console.log(e)
    })
    }
  }

  render() {
    const {
      agreementContract,
      agreementContractAmount,
      agreementScriptHash,
      nextAgreementContract,
      nextAgreementContractAmount,
      nextAgreementScriptHash
      // @ts-ignore
    } = this.state;
    // @ts-ignore
    const { ownerContract, ownerContractAmount, payerContractScriptHash } = this.props;
    if (payerContractScriptHash && agreementScriptHash && nextAgreementScriptHash){
      const props = {
        ownerContract,
        ownerContractAmount,
        payerContractScriptHash,
        agreementContract,
        agreementContractAmount,
        agreementScriptHash,
        nextAgreementContractAddress: nextAgreementContract.address
      }
      const nextContractProps = {
        ownerContract,
        ownerContractAmount,
        payerContractScriptHash,
        agreementContract: nextAgreementContract,
        agreementContractAmount: nextAgreementContractAmount,
        agreementScriptHash: nextAgreementScriptHash
      }

      return (
        <>
        <OwnerContract {...props}></OwnerContract>
        <div className={'box'}>
        <AgreementContract {...props}></AgreementContract>
        <AgreementContract {...nextContractProps}></AgreementContract>
        </div>
        </>
      )
    }
    return <div></div>
  }
}


export class ContractWrapper extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
    // @ts-ignore
    this.state = {
      agreementContract: undefined,
      ownerContractAmount: undefined,
      payerContractScriptHash: undefined
    };
  }
  
  // const [ ownerContract, ownerContractAmount, payerContractScriptHash ] = useContract(ownerContractParams, 'Owner.cash')
  componentDidMount = () => {
    const ownerContractParams = [ownerPk]
    getContractInfo(ownerContractParams, 'Payer.cash').then((res) => {
      console.log(res)
      // @ts-ignore
      this.setState({ ownerContract: res[0], ownerContractAmount: res[1], payerContractScriptHash: res[2] })
    }).catch((e) => {
      console.log(e)
    })
    
  }

  render() {
    // @ts-ignore
    const { ownerContract, ownerContractAmount, payerContractScriptHash } = this.state;

    if (ownerContract && payerContractScriptHash){
      return (
        <>
        <AgreementContractWrapper ownerContract={ownerContract} ownerContractAmount={ownerContractAmount} payerContractScriptHash={payerContractScriptHash}></AgreementContractWrapper>
        </>
      )
    }
    return <div></div>
  }
}