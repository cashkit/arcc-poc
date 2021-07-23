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
        <div className="column">Change Amount</div>
        <div className="column is-5">{contract?.amountToNextState}</div>
      </div>
      )
    }

    return (
    <div className="columns">
      <div className="column">Amount to Next State:</div>
      <div className="column is-5">{contract?.amountToNextState}</div>
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
        <div className="column ">
          Next Agreement Contract Address:
          <div className="">
            <a style={{ color: '#53B8BB' }} target='_' href={`https://explorer.bitcoin.com/bch/address/${contract?.nextAgreementContractAddress}`}>
            {truncate(contract?.nextAgreementContractAddress)}<FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
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
        <div key={index} className="box">
          <div className="columns">
            <div className="column ">Type: {contract?.type}</div>
            <div className="column title has-text-grey is-1 mr-4 pt-0" onClick={() => this.removeSelected(index)}>x</div>
          </div>
          
          <div className="columns">
            <div className="column ">Time:</div>
            <div className="column  is-6">{contract?.time}</div>
          </div>

          <div className="columns">
            <div className="column">
              Agreement Contract Address:
              <div>
                <a style={{ color: '#53B8BB' }} target='_' href={`https://explorer.bitcoin.com/bch/address/${contract?.agreementContractAddress}`}>
                {truncate(contract?.agreementContractAddress)}<FontAwesomeIcon className="ml-3" icon={faExternalLinkAlt} />
                </a>
              </div>
            </div>
          </div>

          {this.renderNextAgreementAdress(contract)}

          <div className="columns">
            <div className="column ">Epoch:</div>
            <div className="column is-5">{contract?.epochState}</div>
          </div>
          
          <div className="columns">
            <div className="column ">Remaining Time:</div>
            <div className="column is-5">{contract?.remainingTimeState}</div>
          </div>

          <div className="columns">
            <div className="column ">Max Amount Per Epoch:</div>
            <div className="column is-5">{contract?.maxAmountPerEpochState}</div>
          </div>

          <div className="columns">
            <div className="column ">Remaining Amount:</div>
            <div className="column is-5">{contract?.remainingAmountState}</div>
          </div>

          <div className="columns">
            <div className="column ">Balance:</div>
            <div className="column is-5">{contract?.agreementContractAmount}</div>
          </div>

          <div className="columns">
            <div className="column ">Send Amount:</div>
            <div className="column is-5">{contract?.sendAmountState}</div>
          </div>

          <div className="columns">
            <div className="column ">Miner Fee:</div>
            <div className="column is-5">{contract?.minerFeeState}</div>
          </div>

          {this.renderNextAmount(contract)}

          <div className="columns">
            <div className="column ">Valid From:</div>
            <div className="column is-5">{contract?.validFromState}</div>
          </div>
        </div>
      )
    }) 
  }

  render(){
    return (
      <div className="column card-gradient">
        <div className="box">
          <div className="title">History</div>
          <div className="has-text-right">
            <button
              onClick={this.refreshHistory}
              className="button mr-2 background-gradient has-text-white">
                Refresh
            </button>
            <button
              onClick={this.clearAll}
              className="button background-gradient has-text-white">
                Clear
            </button>
          </div>
        </div>
        {this.renderExecuteStateDetails()}
      </div>
    )
  }
}