// App.jsx
import React from 'react';
import SchemaBuilder from './components/SchemaBuilder';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <h1>JSON Schema Builder</h1>
      <SchemaBuilder />
    </div>
  );
}
