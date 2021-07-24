import React from 'react';
import { MdClear, MdLaunch, MdRefresh } from "react-icons/md";
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
            {truncate(contract?.nextAgreementContractAddress)}<MdLaunch size={18}/>
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
            <MdClear size={20} className="mr-3 mt-3" color={'#7C83FD'} onClick={() => this.removeSelected(index)} />
          </div>
          
          <div className="columns">
            <div className="column ">Time:</div>
            <div className="column  is-8">{contract?.time}</div>
          </div>

          <div className="columns">
            <div className="column">
              Agreement Contract Address:
              <div>
                <a style={{ color: '#53B8BB' }} target='_' href={`https://explorer.bitcoin.com/bch/address/${contract?.agreementContractAddress}`}>
                {truncate(contract?.agreementContractAddress)}<MdLaunch size={18}/>
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
      <div className="card-gradient">
        <div className="box">
          <div className="title">History</div>
          <div className="has-text-right">
            <MdRefresh size={20} color={'#7C83FD'} onClick={this.refreshHistory} />
            <MdClear size={20} className="ml-3" color={'#7C83FD'} onClick={this.clearAll} />
          </div>
        </div>
        {this.renderExecuteStateDetails()}
      </div>
    )
  }
}