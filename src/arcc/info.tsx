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
              <p className="modal-card-title has-text-white"></p>
            </header>
            <section className="modal-card-body">
              <div className="menu has-text-left">
                <p className="menu-label">
                  Amount
                </p>
                <ul className="menu-list">
                  <li>Spending <code>amount</code> should be less than <code>maxAmountPerEpoch</code></li>
                  <li>Spending <code>amount</code> should be greater than dust limit i.e <code>546</code></li>
                  <li><code>maxAmountPerEpoch</code> should be greater than dust limit i.e <code>546</code></li>
                  <li><code>remainingAmount</code> should be less than <code>maxAmountPerEpoch</code></li>
                  <li><code>newRemainingAmount</code> should be greater than <code>0</code></li>
                  <li><code>amountToNextState</code> should be greater than <code>546</code></li>
                </ul>
                <p className="menu-label">
                  Time
                </p>
                <ul className="menu-list">
                  <li><code>epoch</code> should be greater than equal to <code>0</code></li>
                  <li><code>remainingTime</code> should be less than equal to <code>epoch</code></li>
                  <li><code>remainingTime</code> should be greater than equal to <code>0</code></li>
                  <li>Spending <code>amount</code> should be greater than dust limit i.e <code>546</code></li>
                </ul>

              </div>
            </section>
          </div>
      </div>
  </>
  )
    
}