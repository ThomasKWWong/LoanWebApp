import React, { useState, useEffect } from "react";
import "./App.css";

// Custom Dropdown component with checkboxes
const DropdownCheckbox = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  return (
    <div className="dropdown">
      <button type="button" className="dropdown-button" onClick={toggleDropdown}>
        {label}: {selectedValues.length > 0 ? `${selectedValues.length} selected` : "Select"}
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <label key={option} className="dropdown-item">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [msamdOptions, setMsamdOptions] = useState([]);
  const [countyOptions, setCountyOptions] = useState([]);
  const [filters, setFilters] = useState({
    msamd: [],
    incomeToDebtMin: "",
    incomeToDebtMax: "",
    countyName: [],
    loanType: "",
    tractToMsamdIncomeMin: "",
    tractToMsamdIncomeMax: "",
    loanPurpose: "",
    propertyType: "",
    ownerOccupied: "",
  });

  // **New state for the response from the backend**
  const [responseData, setResponseData] = useState([]);
  
  // **New state to track if results should be displayed**
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    const fetchMsamdOptions = async () => {
      const response = await fetch('http://localhost:8080/api/msamd');
      const data = await response.json();
      setMsamdOptions(data);
    };

    const fetchCountyOptions = async () => {
      const response = await fetch('http://localhost:8080/api/county');
      const data = await response.json();
      setCountyOptions(data);
    };

    fetchMsamdOptions();
    fetchCountyOptions();
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Filters submitted:", filters);
  
    // **Send the filters to the backend**
    fetch("http://localhost:8080/api/filters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data from backend:", data); 
        // Ensure that the response data is always an array
        setResponseData(Array.isArray(data) ? data : []);
        setShowResults(true); // **Show the results once the data is received**
      })
      .catch((error) => console.error("Error:", error));
  };
  

  // **Handle Approve button click**
  const handleApprove = () => {
    console.log("Approved");
    // You can send an approval status to the backend here if needed
  };

  // **Handle Deny button click**
  const handleDeny = () => {
    console.log("Denied");
    // Reset the response data and hide the results
    setResponseData([]);
    setShowResults(false);
  };

  return (
    <div className="App">
      <h1>Filter Options</h1>
      <form onSubmit={handleSubmit}>
        
        {/* MSAMD Dropdown with Checkboxes */}
        <DropdownCheckbox 
          label="MSAMD" 
          options={msamdOptions} 
          selectedValues={filters.msamd} 
          onChange={(selectedMsamd) => setFilters({ ...filters, msamd: selectedMsamd })} 
        />
        
        {/* Income to Debt Ratio Inputs */}
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

        {/* County Dropdown with Checkboxes */}
        <DropdownCheckbox 
          label="County" 
          options={countyOptions} 
          selectedValues={filters.countyName} 
          onChange={(selectedCounty) => setFilters({ ...filters, countyName: selectedCounty })} 
        />

        {/* Loan Type */}
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

        {/* Tract to MSAMD Income Inputs */}
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

        {/* Loan Purpose */}
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

        {/* Property Type */}
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

        {/* Owner Occupied */}
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

      {/* **Conditional rendering of the results** */}
      {showResults && (
        <>
          <h2>Results</h2>
          <div>
            {responseData.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>

          {/* **Approve and Deny buttons** */}
          <div>
            <button onClick={handleApprove}>Approve</button>
            <button onClick={handleDeny}>Deny</button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
