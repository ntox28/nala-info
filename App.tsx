import React from 'react';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  return (
    // The main styling is now on the body via index.html, 
    // this component just renders the dashboard.
    <Dashboard />
  );
};

export default App;