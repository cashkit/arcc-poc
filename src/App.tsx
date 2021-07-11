
import { AgreementContractWrapper } from './arcc';

import './App.css'
import "../node_modules/bulma/bulma.sass";
import './App.sass'

function App() {
  return (
    <div className="App">
      <div className="App-header">ARCC: Allowable Revocable Contract Chain System for Bitcoin Cash</div>
      <div className="p-5">
        <AgreementContractWrapper></AgreementContractWrapper>
      </div>
    </div>
  );
}

export default App;
