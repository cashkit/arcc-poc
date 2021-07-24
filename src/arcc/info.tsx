import React, { useState } from 'react';
import { MdMenu } from "react-icons/md";


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
                  <li>Once the current contract is funded, <code style={{ color: '#7C83FD' }}>amount</code>being spent is responsible for deriving the next state but the real state is only derived once a transaction is done from the contract as it is also dependent of <code style={{ color: '#7C83FD' }}>remainingTime</code> and <code style={{ color: '#7C83FD' }}>locktime</code>.</li>
                  
                  <li>In order for us to derive the state in the UI, we need to calculate(predict) these three parameters that the contract would automatically calculate.
                    <code style={{ color: '#7C83FD' }}>Remaining Spendable Amount</code>, <code style={{ color: '#7C83FD' }}>Remaining Time</code> and  <code style={{ color: '#7C83FD' }}>validFrom</code>.
                  </li>
                  <li>All other parameters must be kept the same.</li>

                <p className="menu-label">
                  Amount
                </p>
                  <li>Spending <code style={{ color: '#7C83FD' }}>amount</code> should be less than <code style={{ color: '#7C83FD' }}>maxAmountPerEpoch</code></li>
                  <li>Spending <code style={{ color: '#7C83FD' }}>amount</code> should be greater than dust limit i.e <code style={{ color: '#7C83FD' }}>546</code></li>
                  <li><code style={{ color: '#7C83FD' }}>maxAmountPerEpoch</code> should be greater than dust limit i.e <code style={{ color: '#7C83FD' }}>546</code></li>
                  <li><code style={{ color: '#7C83FD' }}>remainingAmount</code> should be less than <code style={{ color: '#7C83FD' }}>maxAmountPerEpoch</code></li>
                  <li><code style={{ color: '#7C83FD' }}>newRemainingAmount</code> should be greater than <code style={{ color: '#7C83FD' }}>0</code></li>
                  <li><code style={{ color: '#7C83FD' }}>amountToNextState</code> should be greater than <code style={{ color: '#7C83FD' }}>546</code></li>
                  Important Note: <li>If <code style={{ color: '#7C83FD' }}>passedTime</code> {`>=`} <code style={{ color: '#7C83FD' }}>remainingTime</code> then spendable amount resets to <code style={{ color: '#7C83FD' }}>maxAmountPerEpoch</code></li>

                <p className="menu-label">
                  Time
                </p>
                  <li><code style={{ color: '#7C83FD' }}>epoch</code> should be greater than equal to <code style={{ color: '#7C83FD' }}>0</code></li>
                  <li><code style={{ color: '#7C83FD' }}>remainingTime</code> should be less than equal to <code style={{ color: '#7C83FD' }}>epoch</code></li>
                  <li><code style={{ color: '#7C83FD' }}>remainingTime</code> should be greater than equal to <code style={{ color: '#7C83FD' }}>0</code></li>
                  <li>Spending <code style={{ color: '#7C83FD' }}>amount</code> should be greater than dust limit i.e <code style={{ color: '#7C83FD' }}>546</code></li>

                  <p className="menu-label">
                  What happens if I send money to a wrongly configured contract?
                </p>
                 At any point in time the Payer can spend money from any contract state.
                <p>
                  For example: If the incorrect contract had the following constructor parameters: <code style={{ color: '#7C83FD' }}>Epoch = 1, maxAmountPerEpoch = 300, remainingTime = 1 remainingSpendableAmount = 3000, validFrom = 697241</code>
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