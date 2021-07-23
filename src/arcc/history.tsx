import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { truncate } from '../utils';


export class History extends React.Component<any, any> {
  interval

  constructor(props) {
    super(props);

    this.state = {
      contracts: []
    };
  }

  componentDidMount = async () => {
    // await localStorage.removeItem('executed_contracts');

    this.showExecutedContractState()
    this.interval = setInterval(() => {
      this.showExecutedContractState()
    }, 2000); 
  }

  componentWillUnmount = () => {
    clearInterval(this.interval)
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
    contracts.splice(index, 1);
    contracts.splice(index + 2, contracts.length - (index + 1));
    await localStorage.setItem('executed_contracts', JSON.stringify(contracts));
    this.showExecutedContractState()
  }

  renderNextAmount = (contract) => {
    if (contract?.type === 'revoke') {
      return (
        <div className="columns">
        <div className="column has-text-grey-lighter">Change Amount</div>
        <div className="column has-text-grey-light is-5">{contract?.amountToNextState}</div>
      </div>
      )
    }

    return (
    <div className="columns">
      <div className="column has-text-grey-light">Amount to Next State:</div>
      <div className="column has-text-grey-light is-5">{contract?.amountToNextState}</div>
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
      <div className="columns">
        <div className="column has-text-grey-lighter">
          Next Agreement Contract Address:
          <div className="has-text-grey-light"> {truncate(contract?.nextAgreementContractAddress)}
            <a target='_' href={`https://explorer.bitcoin.com/bch/address/${contract?.nextAgreementContractAddress}`}>
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
          <div className="columns">
            <div className="column has-text-grey-light">Type: {contract?.type}</div>
            <div className="column title has-text-grey is-1 mr-4 pt-0" onClick={() => this.removeSelected(index)}>x</div>
          </div>
          
          <div className="columns">
            <div className="column has-text-grey-lighter">Time:</div>
            <div className="column has-text-grey-light is-6">{contract?.time}</div>
          </div>

          <div className="columns">
            <div className="column has-text-grey-lighter">
              Agreement Contract Address:
              <div className="has-text-grey-light"> {truncate(contract?.agreementContractAddress)}
                <a target='_' href={`https://explorer.bitcoin.com/bch/address/${contract?.agreementContractAddress}`}>
                  <FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
                </a>
              </div>
            </div>
          </div>

          {this.renderNextAgreementAdress(contract)}

          <div className="columns">
            <div className="column has-text-grey-lighter">Epoch:</div>
            <div className="column has-text-grey-light is-5">{contract?.epochState}</div>
          </div>
          
          <div className="columns">
            <div className="column has-text-grey-lighter">Remaining Time:</div>
            <div className="column has-text-grey-light is-5">{contract?.remainingTimeState}</div>
          </div>

          <div className="columns">
            <div className="column has-text-grey-lighter">Max Amount Per Epoch:</div>
            <div className="column has-text-grey-light is-5">{contract?.maxAmountPerEpochState}</div>
          </div>

          <div className="columns">
            <div className="column has-text-grey-lighter">Remaining Amount:</div>
            <div className="column has-text-grey-light is-5">{contract?.remainingAmountState}</div>
          </div>

          <div className="columns">
            <div className="column has-text-grey-lighter">Balance:</div>
            <div className="column has-text-grey-light is-5">{contract?.agreementContractAmount}</div>
          </div>

          <div className="columns">
            <div className="column has-text-grey-lighter">Send Amount:</div>
            <div className="column has-text-grey-light is-5">{contract?.sendAmountState}</div>
          </div>

          <div className="columns">
            <div className="column has-text-grey-lighter">Miner Fee:</div>
            <div className="column has-text-grey-light is-5">{contract?.minerFeeState}</div>
          </div>

          {this.renderNextAmount(contract)}

          <div className="columns">
            <div className="column has-text-grey-lighter">Valid From:</div>
            <div className="column has-text-grey-light is-5">{contract?.validFromState}</div>
          </div>

          <div className="mb-2 pb-3" style={{ borderBottom: '3px solid rgb(30, 32, 35)' }}></div>
        </div>
      )
    }) 
  }

  render(){
    let arrangement = 'columns column light-dark-theme-color m-0';
    if (this.state.contracts.length === 0){ arrangement = 'columns light-dark-theme-color m-1' }

    return (
      <div className="columns is-multiline">
        <div className={arrangement} style={{ borderBottom: '3px solid rgb(30, 32, 35)' }}>
          <div className="title has-text-grey-light pl-3 pt-3">History</div>
          <div className="column has-text-right">
            <button
              onClick={this.refreshHistory}
              style={{ borderWidth: 0 }}
              className="button has-text-grey-lighter mr-2 dark-theme-color">
                Refresh
            </button>
            <button
              onClick={this.clearAll}
              style={{ borderWidth: 0 }}
              className="button has-text-grey-lighter dark-theme-color">
                Clear
            </button>
          </div>
        </div>
        <div className="column light-dark-theme-color">
            {this.renderExecuteStateDetails()}
        </div>
      </div>
    )
  }
}