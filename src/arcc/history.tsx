import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { truncate } from '../utils';


export class History extends React.Component<any, any> {

  constructor(props) {
    super(props);

    this.state = {
      contracts: []
    };
  }

  componentDidMount = async () => {
    // await localStorage.removeItem('executed_contracts');
    // Ignoring the memory leak :)
    this.showExecutedContractState()
    setInterval(() => {
      this.showExecutedContractState()
    }, 2000); 
  }

  showExecutedContractState = async () => {
    const res = await localStorage.getItem('executed_contracts');
    let prevContracts;
    if (!res) {
      prevContracts = []
    } else {
      prevContracts = JSON.parse(res)
    }

    this.setState(() => ({
      contracts: [...prevContracts]
    }))
  }

  refreshHistory = () => {
    this.showExecutedContractState()
  }

  clearAll = async () => {
    await localStorage.removeItem('executed_contracts');
    this.showExecutedContractState()
  }

  removeSelected = async (index) => {
    const { contracts } = this.state;

    console.log(contracts)


    contracts.splice(index, 1);
    //contracts.splice(index, 0, 0);
    contracts.splice(index + 2, contracts.length - (index + 1));

    console.log(index, contracts)

    await localStorage.setItem('executed_contracts', JSON.stringify(contracts));
    this.showExecutedContractState()
  }

  renderNextAmount = (contract) => {
    if (contract?.type === 'revoke') {
      return (
        <div className="columns">
        <div className="column has-text-white">Change Amount</div>
        <div className="column has-text-grey-lighter is-5">{contract?.amountToNextState}</div>
      </div>
      )
    }

    return (
    <div className="columns">
      <div className="column has-text-white">`Amount to Next State:</div>
      <div className="column has-text-grey-lighter is-5">{contract?.amountToNextState}</div>
    </div>
    )
  }

  renderNextAgreementAdress = (contract) => {
    if (contract?.type === 'revoke') {
      return (
        undefined
      )
    }
    return (
      <div className="columns ml-1 mt-1">
        <div className="has-text-white pr-1">
          Next Agreement Contract Address:
          <div className="has-text-grey-lighter">
            <a target='_' href={`https://explorer.bitcoin.com/bch/address/${contract?.nextAgreementContractAddress}`}>
              {truncate(contract?.nextAgreementContractAddress)}
              <FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
            </a>
          </div>
        </div>
      </div>
    )
  }

  renderExecuteStateDetails = () => {
    const { contracts } = this.state;
    return contracts.map((contract, index) => {
      return (
        <div key={index}>
          <div className="columns pl-1">
            <div className="column title has-text-grey-lighter">Type: {contract?.type}</div>
            <div className="column title has-text-grey is-1 mr-2 pt-0" onClick={() => this.removeSelected(index)}>x</div>
          </div>
          <div className="columns">
            <div className="column has-text-white">Time:</div>
            <div className="column has-text-grey-lighter is-6">{contract?.time}</div>
          </div>

          <div className="columns ml-1 mt-1">
            <div className="has-text-white pr-1">
              Agreement Contract Address:
              <div className="has-text-grey-lighter">
                <a target='_' href={`https://explorer.bitcoin.com/bch/address/${contract?.agreementContractAddress}`}>
                  {truncate(contract?.agreementContractAddress)}
                  <FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
                </a>
              </div>
            </div>
          </div>

          {this.renderNextAgreementAdress(contract)}

          <div className="columns">
            <div className="column has-text-white">Epoch:</div>
            <div className="column has-text-grey-lighter is-5">{contract?.epochState}</div>
          </div>
          
          <div className="columns">
            <div className="column has-text-white">Remaining Time:</div>
            <div className="column has-text-grey-lighter is-5">{contract?.remainingTimeState}</div>
          </div>

          <div className="columns">
            <div className="column has-text-white">Max Amount Per Epoch:</div>
            <div className="column has-text-grey-lighter is-5">{contract?.maxAmountPerEpochState}</div>
          </div>

          <div className="columns">
            <div className="column has-text-white">Remaining Amount:</div>
            <div className="column has-text-grey-lighter is-5">{contract?.remainingAmountState}</div>
          </div>

          <div className="columns">
            <div className="column has-text-white">Balance:</div>
            <div className="column has-text-grey-lighter is-5">{contract?.agreementContractAmount}</div>
          </div>

          <div className="columns">
            <div className="column has-text-white">Send Amount:</div>
            <div className="column has-text-grey-lighter is-5">{contract?.sendAmountState}</div>
          </div>

          <div className="columns">
            <div className="column has-text-white">Miner Fee:</div>
            <div className="column has-text-grey-lighter is-5">{contract?.minerFeeState}</div>
          </div>

          {this.renderNextAmount(contract)}

          <div className="columns">
            <div className="column has-text-white">Valid From:</div>
            <div className="column has-text-grey-lighter is-5">{contract?.validFromState}</div>
          </div>

          <div className="mb-2 pb-3" style={{ borderBottom: '5px solid rgb(30, 32, 35)' }}></div>
        </div>
      )
    }) 
  }

  render(){
    return (
      <div className="columns is-multiline pb-4">
        <div className="columns column is-full" style={{ backgroundColor: 'rgb(42, 45, 47)' }}>
          <div className="title has-text-white pl-3 pt-3">History</div>
          <div className="column has-text-right">
            <button
              onClick={this.refreshHistory}
              style={{ backgroundColor: 'rgb(30, 32, 35)', borderWidth: 0 }}
              className="button has-text-white mr-2">
                Refresh
            </button>
            <button
              onClick={this.clearAll}
              style={{ backgroundColor: 'rgb(30, 32, 35)', borderWidth: 0 }}
              className="button has-text-white">
                Clear
            </button>
          </div>
        </div>
        <div className="column is-full" style={{ backgroundColor: 'rgb(42, 45, 47)' }}>
            {this.renderExecuteStateDetails()}
        </div>
      </div>
    )
  }
}