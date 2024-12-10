import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [filters, setFilters] = useState({
    msamd: "",
    incomeToDebtMin: "",
    incomeToDebtMax: "",
    counties: [],
    loanType: "",
    tractToMsamdIncomeMin: "",
    tractToMsamdIncomeMax: "",
    loanPurpose: "",
    propertyType: "",
    ownerOccupied: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Filters submitted:", filters);
    // Send these filters to the Spring backend using fetch or axios
    fetch("http://localhost:8080/apply-filters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data from backend:", data);
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="App">
      <h1>Filter Options</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>MSAMD:</label>
          <input
            type="text"
            name="msamd"
            value={filters.msamd}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Income to Debt Ratio:</label>
          <input
            type="number"
            name="incomeToDebtMin"
            placeholder="Min"
            value={filters.incomeToDebtMin}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="incomeToDebtMax"
            placeholder="Max"
            value={filters.incomeToDebtMax}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>County:</label>
          <input
            type="text"
            name="counties"
            value={filters.counties}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Loan Type:</label>
          <select
            name="loanType"
            value={filters.loanType}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="1">Conventional</option>
            <option value="2">FHA-insured</option>
            <option value="3">VA-guaranteed</option>
            <option value="4">FSA/RHS</option>
          </select>
        </div>
        <div>
          <label>Tract to MSAMD Income:</label>
          <input
            type="number"
            name="tractToMsamdIncomeMin"
            placeholder="Min"
            value={filters.tractToMsamdIncomeMin}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="tractToMsamdIncomeMax"
            placeholder="Max"
            value={filters.tractToMsamdIncomeMax}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Loan Purpose:</label>
          <select
            name="loanPurpose"
            value={filters.loanPurpose}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="1">Home Purchase</option>
            <option value="2">Home Improvement</option>
            <option value="3">Refinancing</option>
          </select>
        </div>
        <div>
          <label>Property Type:</label>
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="1">One-to-four family</option>
            <option value="2">Manufactured housing</option>
            <option value="3">Multifamily</option>
          </select>
        </div>
        <div>
          <label>Owner Occupied:</label>
          <select
            name="ownerOccupied"
            value={filters.ownerOccupied}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="1">Owner-occupied</option>
            <option value="2">Not owner-occupied</option>
            <option value="3">Not applicable</option>
          </select>
        </div>
        <button type="submit">Apply Filters</button>
      </form>
    </div>
  );
};

export default App;
