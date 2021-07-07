import React from 'react';
import { OwnerContract } from './payer';
import { AgreementContract } from './agreement';
import {
  coOwnerPk,
  getContractInfo,
  initialState,
  ownerPk,
  maxSpendable,
  minSpendableInterval,
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
    const { ownerScriptHash } = this.props;
    if ( ownerScriptHash ) {
      const agreementContractParams = [ownerPk, ownerScriptHash, coOwnerPk, maxSpendable, minSpendableInterval, initialState]

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
    const { ownerContract, ownerContractAmount, ownerScriptHash } = this.props;
    if (ownerScriptHash && agreementScriptHash){
      const props = { ownerContract, ownerContractAmount, ownerScriptHash, agreementContract, agreementContractAmount, agreementScriptHash }
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
      ownerScriptHash: undefined
    };
  }
  
  // const [ ownerContract, ownerContractAmount, ownerScriptHash ] = useContract(ownerContractParams, 'Owner.cash')
  componentDidMount = () => {
    const ownerContractParams = [ownerPk]
    getContractInfo(ownerContractParams, 'Owner.cash').then((res) => {
      console.log(res)
      // @ts-ignore
      this.setState({ ownerContract: res[0], ownerContractAmount: res[1], ownerScriptHash: res[2] })
    }).catch((e) => {
      console.log(e)
    })
    
  }

  render() {
    // @ts-ignore
    const { ownerContract, ownerContractAmount, ownerScriptHash } = this.state;

    if (ownerContract && ownerScriptHash){
      return (
        <>
        <AgreementContractWrapper ownerContract={ownerContract} ownerContractAmount={ownerContractAmount} ownerScriptHash={ownerScriptHash}></AgreementContractWrapper>
        </>
      )
    }
    return <div></div>
  }
}