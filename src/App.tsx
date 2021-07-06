
import { ContractWrapper } from './arcc';

import './App.css'
import "../node_modules/bulma/bulma.sass";
import './App.sass'

function App() {
  return (
    <div className="App">
      <div className="p-6">
        <ContractWrapper></ContractWrapper>
      </div>
    </div>
  );
}

export default App;
