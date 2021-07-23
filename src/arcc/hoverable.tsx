import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'


export const HoverableHeading = (props) => {

  return (
    <div className="columns is-4 mt-2 pl-3">
      <label className="title is-4 pt-2">{props.title}</label>
      <div className="dropdown is-hoverable">
      <div className="dropdown-trigger has-text-centered is-centered">
          <FontAwesomeIcon className="ml-3 pb-0 mb-0" icon={faQuestionCircle} />
      </div>
      <div className="dropdown-menu" id="dropdown-menu4" role="menu">
        <div className="dropdown-content">
          <div className="dropdown-item">
            <p>{props.info}
            </p>
          </div>
        </div>
      </div>
      </div>
  </div>
  )
}


export const HoverableSubHeading = (props) => {
  return (
    <div className="columns is-4 mt-2 pl-3">
      <label className="label ">{props.title}</label>
      <div className="dropdown is-hoverable">
      <div className="dropdown-trigger has-text-centered is-centered">
          <FontAwesomeIcon className="ml-3 pb-0 mb-0" icon={faQuestionCircle} />
      </div>
      <div className="dropdown-menu" id="dropdown-menu4" role="menu">
        <div className="dropdown-content">
          <div className="dropdown-item">
            <p>{props.info}
            </p>
          </div>
        </div>
      </div>
      </div>
  </div>
  )
}