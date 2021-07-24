import React, { useState } from 'react';
import { MdMenu } from "react-icons/md";

const CCode = (props) => {
  return <code style={{ color: '#7C83FD' }}>{props.children}</code>
}

export const InfoComponent = () => {
  const [activeState, setActiveState] = useState(false)

  const toggleActive = () => {
    activeState ? setActiveState(false) : setActiveState(true)
  }

  return (
    <>
      <MdMenu size={25} color={'#7C83FD'} onClick={toggleActive} />
        
      <div className={`modal ${activeState ? 'is-active' : ''}`}>
        <div className="modal-background" onClick= {toggleActive}></div>
          <div className="modal-card" >
            <header className="modal-card-head has-text-centered has-text-white background-gradient">
              <p className="modal-card-title has-text-white">Instructions</p>
            </header>
            <section className="modal-card-body">
              <div className="menu has-text-left has-text-black">

              <p className="menu-label">
                  Spending from Current State
                </p>
                  <li>Make sure the conditions mentioned under section Amount and Time are fulfilled as once the money is spend to a wrong contract state, it can only be taken back by the Payer.</li>

                <p className="menu-label">
                  Deriving Next State
                </p>
                  <li>Any changes to the constructor parameters will be responsible for a new and unique contract state.</li>
                  <li>Once the current contract is funded, <CCode>amount</CCode>being spent is responsible for deriving the next state but the real state is only derived once a transaction is done from the contract as it is also dependent of <CCode>remainingTime</CCode> and <CCode>locktime</CCode>.</li>
                  
                  <li>In order for us to derive the state in the UI, we need to calculate(predict) these three parameters that the contract would automatically calculate.
                    <CCode>Remaining Spendable Amount</CCode>, <CCode>Remaining Time</CCode> and  <CCode>validFrom</CCode>.
                  </li>
                  <li>All other parameters must be kept the same.</li>

                <p className="menu-label">
                  Amount
                </p>
                  <li>Spending <CCode>amount</CCode> should be less than <CCode>maxAmountPerEpoch</CCode></li>
                  <li>Spending <CCode>amount</CCode> should be greater than dust limit i.e <CCode>546</CCode></li>
                  <li><CCode>maxAmountPerEpoch</CCode> should be greater than dust limit i.e <CCode>546</CCode></li>
                  <li><CCode>remainingAmount</CCode> should be less than <CCode>maxAmountPerEpoch</CCode></li>
                  <li><CCode>newRemainingAmount</CCode> should be greater than <CCode>0</CCode></li>
                  <li><CCode>amountToNextState</CCode> should be greater than <CCode>546</CCode></li>
                  Important Note: <li>If <CCode>passedTime</CCode> {`>=`} <CCode>remainingTime</CCode> then spendable amount resets to <CCode>maxAmountPerEpoch</CCode>, but the constructor parameters must not be changed.</li>

                <p className="menu-label">
                  Time
                </p>
                  <li><CCode>epoch</CCode> should be greater than equal to <CCode>0</CCode></li>
                  <li><CCode>remainingTime</CCode> should be less than equal to <CCode>epoch</CCode></li>
                  <li><CCode>remainingTime</CCode> should be greater than equal to <CCode>0</CCode></li>
                  <li>Spending <CCode>amount</CCode> should be greater than dust limit i.e <CCode>546</CCode></li>

                  <p className="menu-label">
                  What happens if I send money to a wrongly configured contract?
                </p>
                 At any point in time the Payer can spend money from any contract state.
                <p>
                  For example: If the incorrect contract had the following constructor parameters: <CCode>Epoch = 1, maxAmountPerEpoch = 300, remainingTime = 1 remainingSpendableAmount = 3000, validFrom = 697241</CCode>
                </p>
                  One only needs to pass the same parameters in order to create the same contract and use the payer's public key to sign a transaction revoking the access from the contract and sending the amount to a different address. 
                
                  <p>Notice, that the maxAmountPerEpoch is less than the remainingSpendableAmount due to which payee won't be able to spend any amount from the contract. 
                </p>

              </div>
            </section>
          </div>
      </div>
  </>
  )
    
}