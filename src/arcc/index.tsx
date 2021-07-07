import React from 'react';
import { OwnerContract } from './payer';
import { AgreementContract } from './agreement';
import {
  getContractInfo,
  ownerPk,
  payerPk,
  payeePk,
  deadline,
  maxAmountPerEpoch,
  epoch,
  remainingAmount,
  validFrom
} from './common';


export class AgreementContractWrapper extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
    // @ts-ignore
    this.state = {
      agreementContract: undefined, agreementContractAmount: undefined, agreementScriptHash: undefined
    };
  }
  
  componentDidMount = () => {
    // @ts-ignore
    const { payerContractScriptHash } = this.props;
    if ( payerContractScriptHash ) {
      const agreementContractParams = [payerPk, payerContractScriptHash, payeePk, deadline, maxAmountPerEpoch, epoch, remainingAmount, validFrom]

      getContractInfo(agreementContractParams, 'Agreement.cash').then((res) => {
        console.log(res)
        // @ts-ignore
        this.setState({ agreementContract: res[0], agreementContractAmount: res[1], agreementScriptHash: res[2] })
      }).catch((e) => {
        console.log(e)
      })
    }
  }

  render() {
    // @ts-ignore
    const { agreementContract, agreementContractAmount, agreementScriptHash } = this.state;
    // @ts-ignore
    const { ownerContract, ownerContractAmount, payerContractScriptHash } = this.props;
    if (payerContractScriptHash && agreementScriptHash){
      const props = { ownerContract, ownerContractAmount, payerContractScriptHash, agreementContract, agreementContractAmount, agreementScriptHash }
      return (
        <>
        <OwnerContract {...props}></OwnerContract>
        <AgreementContract {...props}></AgreementContract>
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