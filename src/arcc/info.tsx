import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faScroll } from '@fortawesome/free-solid-svg-icons'

export const InfoComponent = () => {
  const [activeState, setActiveState] = useState(false)

  const toggleActive = () => {
    activeState ? setActiveState(false) : setActiveState(true)
  }

  return (
    <>
      <div className="has-text-white" onClick={toggleActive}>
        <FontAwesomeIcon className="mr-2" icon={faScroll}></FontAwesomeIcon>
        Instructions
      </div>
      <div className={`modal ${activeState ? 'is-active' : ''}`}>
        <div className="modal-background" onClick= {toggleActive}></div>
          <div className="modal-card" >
            <header className="modal-card-head has-text-centered has-text-white" style={{ backgroundColor: 'rgb(42, 45, 47)' }}>
              <p className="modal-card-title has-text-white">Instructions</p>
            </header>
            <section className="modal-card-body">
              <div className="menu has-text-left has-text-black">

              <p className="menu-label">
                  Spending from Current State
                </p>
                  <li>Make sure the conditions mentioned under section Amount and Time are fulfilled as once the money is spend to a wrong contract state it can only be taken back by the payer.</li>

                <p className="menu-label">
                  Deriving Next State
                </p>
                  <li>Any changes to the constructor parameters will be responsible for a new and unique contract state.</li>
                  <li>Once the current contract is funded, the following parameter: <code className="has-text-grey">Amount being spent</code> is responsible for deriving the next state.</li>
                    <p>However, in order for us to derive the state in the UI, we need to calculate there two
                    parameters as well: <code className="has-text-grey">Remaining Spendable Amount</code> and <code className="has-text-grey">Remaining Time</code>.</p>
                    All the other parameters must be kept the same.
                  <li><code className="has-text-grey">Amount being spent</code> affects the remaining amount spendable
                    for the next State and hence creates a new address.</li>

                    <p>Depending on when(block height) the current contract is executed the money is spent to a different state because the variables change with time:
                    <code className="has-text-grey">tx.locktime</code>,
                    <code className="has-text-grey">newRemainingTime</code> & 
                    <code className="has-text-grey">newRemainingAmount</code>
                  <li>If the epoch has passed then the Remaining Amount Spendable will be = Max Amount Per Epoch.</li>
                
                </p>

                <p className="menu-label">
                  Amount
                </p>
                  <li>Spending <code>amount</code> should be less than <code>maxAmountPerEpoch</code></li>
                  <li>Spending <code>amount</code> should be greater than dust limit i.e <code>546</code></li>
                  <li><code>maxAmountPerEpoch</code> should be greater than dust limit i.e <code>546</code></li>
                  <li><code>remainingAmount</code> should be less than <code>maxAmountPerEpoch</code></li>
                  <li><code>newRemainingAmount</code> should be greater than <code>0</code></li>
                  <li><code>amountToNextState</code> should be greater than <code>546</code></li>
                <p className="menu-label">
                  Time
                </p>
                  <li><code>epoch</code> should be greater than equal to <code>0</code></li>
                  <li><code>remainingTime</code> should be less than equal to <code>epoch</code></li>
                  <li><code>remainingTime</code> should be greater than equal to <code>0</code></li>
                  <li>Spending <code>amount</code> should be greater than dust limit i.e <code>546</code></li>

                  <p className="menu-label">
                  What happens if I send money to a wrongly configured contract?
                </p>
                 At any point in time the payer can spend money in any contract state. The Payer can revoke the money from the contract once all the parameters are mentioned to derive the incorrect contract state.
                <p>
                  For example: If the incorrect contract had the following constructor parameters: <code className="has-text-grey">Epoch = 1, maxAmountPerEpoch = 300, remainingTime = 1 remainingSpendableAmount = 3000, validFrom = 697241</code>
                  </p>
                  <p>Notice, that the maxAmountPerEpoch is less than the remainingSpendableAmount due to which payee won't be able to spend any amount from the contract. 
                </p>

              </div>
            </section>
          </div>
      </div>
  </>
  )
    
}