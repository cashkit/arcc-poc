import React from 'react';
import { binToHex, hexToBin, numberToBinUint32LE } from '@bitauth/libauth';
import { hexToNum } from '../utils/helpers';
// import { OwnerContract } from './payer';
import { AgreementContract } from './agreement';
import {
  CommonComponent,
  getContractInfo,
  ownerPk,
  payerPk,
  payeePk,
  remainingTime,
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
          payeePk,
          maxAmountPerEpoch,
          epoch,
          remainingTime,
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

      // const n2b = numberToBinUint32LE(695440)
      // const b2h = binToHex(n2b)
      // console.log(b2h)
      // const h2b = hexToBin(b2h)
      // console.log(h2b)
      // //console.log(hexToNum('1039', 2, false))
      
      // console.log(hexToNum('2202', 2))
      // console.log(hexToNum('049d0a00'))

      const nextRemainingAmount = numberToBinUint32LE(2000);
      const newRemainingTime = numberToBinUint32LE(6);

      const nextAgreementContractParams = [
        payerPk,
        payeePk,
        maxAmountPerEpoch,
        epoch,
        newRemainingTime,
        nextRemainingAmount,
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
    // const { ownerContract, ownerContractAmount, payerContractScriptHash } = this.props;
    // if (payerContractScriptHash && agreementScriptHash && nextAgreementScriptHash){
    if ( agreementScriptHash && nextAgreementScriptHash){
      const props = {
        // ownerContract,
        // ownerContractAmount,
        // payerContractScriptHash,
        agreementContract,
        agreementContractAmount,
        agreementScriptHash,
        nextAgreementContractAddress: nextAgreementContract.address
      }
      const nextContractProps = {
        // ownerContract,
        // ownerContractAmount,
        // payerContractScriptHash,
        agreementContract: nextAgreementContract,
        agreementContractAmount: nextAgreementContractAmount,
        agreementScriptHash: nextAgreementScriptHash,
        nextAgreementContractAddress: undefined
      }

      return (
        <>
        <CommonComponent></CommonComponent>
        {/* <OwnerContract {...props}></OwnerContract> */}
        <AgreementContract {...props}></AgreementContract>
        <AgreementContract {...nextContractProps}></AgreementContract>
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
        <AgreementContractWrapper
          ownerContract={ownerContract}
          ownerContractAmount={ownerContractAmount}
          payerContractScriptHash={payerContractScriptHash}>
        </AgreementContractWrapper>
        </>
      )
    }
    return <div></div>
  }
}