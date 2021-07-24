import React from 'react';

import { MdHelp } from "react-icons/md";


export const HoverableHeading = (props) => {

  return (
    <div className="columns is-4 mt-2 pl-3">
      <label className="title is-4 pt-2">{props.title}</label>
      <div className="dropdown is-hoverable">
      <div className="dropdown-trigger has-text-centered is-centered">
        <MdHelp size={18} className="ml-2" color={'#F5C6AA'} />
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
      <label className="label">{props.title}</label>
      <div className="dropdown is-hoverable">
      <div className="dropdown-trigger has-text-centered is-centered">
        <MdHelp size={18} className="ml-2" color={'#F5C6AA'} />
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

export const HoverableSubHeadingLight = (props) => {
  return (
    <div className="columns">
      <label className="has-text-white">{props.title}</label>
      <div className="dropdown is-hoverable">
      <div className="dropdown-trigger has-text-centered is-centered">
        <MdHelp size={18} className="ml-2" color={'#F5C6AA'} />
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