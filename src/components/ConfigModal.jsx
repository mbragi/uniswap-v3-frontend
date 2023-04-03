import React from 'react'

function ConfigModal(props) {
 const { slippageAmount, setSlippageAmount, onClose, deadLineMinutes, setDeadLineMinutes } = props
 return (
  <div className='modaly' onClick={onClose}>
   <div className="modal-content" onClick={e => e.stopPropagation()}>
    <div className="modal-body">
     <h4 className="titleHeader">
      Transaction Settings
     </h4>
     <div className="row">
      <label htmlFor="" className="labelField">Slippage Tolerance</label>
     </div>
     <div className="row">
      <div className="col-md-9 fieldContainer">
       <input type="text" className="inputField" placeholder='1.00' defaultValue={slippageAmount} onChange={e => setSlippageAmount(e.target.value)} />
      </div>
      <div className="col-md-3 inputFieldUnitsContainer">
       <span>%</span>
      </div>
     </div>
     <div className="row">
      <label htmlFor="" className="labelField">Transaction Deadline</label>
     </div>
     <div className="row">
      <div className="col-md-9 fieldContainer">
       <input type="text" className="inputField" placeholder='10' defaultValue={deadLineMinutes} onChange={e => setDeadLineMinutes(e.target.value)} />
      </div>
      <div className="col-md-3 inputFieldUnitsContainer">
       <span>minutes</span>
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}

export default ConfigModal