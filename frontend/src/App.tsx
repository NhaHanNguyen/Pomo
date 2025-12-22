import React from 'react';
import './App.css';

class App extends React.Component<{}, {}> {
  render() {
    return (
    <div className="App">
        <p className="counter">0</p>
        <button className="incrementButton">Increment</button>
    </div>
  );
  }
}

export default App;
