import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Filter from "./Pages/Filter.js";
import Add from "./Pages/Add.js";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Filter />} />
          <Route path="/add" element={<Add />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
