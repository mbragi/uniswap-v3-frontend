import React from 'react'

function PageButton(props) {
 return (
  <div className="btn">
   <span className={props.isBold ? "pageButtonBold" : "hoverBold"}>
    {props.name}
   </span>
  </div>
 )
}

export default PageButton