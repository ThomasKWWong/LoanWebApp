import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import '../App.css';

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

  const [responseData, setResponseData] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const navigate = useNavigate();  // Initialize useNavigate hook

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    const fetchMsamdOptions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/msamd');
        const data = await response.json();
        setMsamdOptions(data);
      } catch (error) {
        console.error('Error fetching MSAMD options:', error);
        setMsamdOptions([
          'Camden - NJ', 'Ocean City - NJ', 'New York, Jersey City', 'White Plains - NY, NJ',
          'Newark - NJ, PA', 'Atlantic City, Hammonton - NJ', 'Trenton - NJ', 'Vineland, Bridgeton - NJ',
          'Allentown, Bethlehem', 'Easton - PA, NJ'
        ]);
      }
    };

    const fetchCountyOptions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/county');
        const data = await response.json();
        setCountyOptions(data);
      } catch (error) {
        console.error('Error fetching county options:', error);
        setCountyOptions([
          'Camden County', 'Cape May County', 'Monmouth County', 'Bergen County', 'Ocean County',
          'Union County', 'Somerset County', 'Essex County', 'Burlington County', 'Gloucester County',
          'Middlesex County', 'Mercer County', 'Morris County', 'Atlantic County', 'Sussex County',
          'Passaic County', 'Warren County', 'Hudson County', 'Salem County', 'Hunterdon County', 'Cumberland County'
        ]);
      }
    };

    fetchMsamdOptions();
    fetchCountyOptions();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Filters submitted:", filters);
  
    try {
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
          setResponseData(Array.isArray(data) ? data : []);
          setShowResults(true);
        })
        .catch((error) => {
          console.error("Error:", error);
          setResponseData(['Sample Result 1', 'Sample Result 2']);
          setShowResults(true);
        });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleApprove = async () => {
    console.log("Approved");
    await fetch('http://localhost:8080/api/approve');
    setShowResults(false);
  };

  const handleDeny = () => {
    console.log("Denied");
    setResponseData([]);
    setShowResults(false);
  };

  // New function to handle "Go to Add" button click
  const handleAddButtonClick = () => {
    navigate('/add');  // Navigate to the '/add' route
  };

  return (
    <div className="App">
      {/* Button to redirect to /add */}
      <button onClick={handleAddButtonClick}>Add a Mortgage</button>
      
      <h1>Filter Options</h1>
      <form onSubmit={handleSubmit}>
        <DropdownCheckbox
          label="MSAMD"
          options={msamdOptions}
          selectedValues={filters.msamd}
          onChange={(selectedMsamd) => setFilters({ ...filters, msamd: selectedMsamd })}
        />

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

        <DropdownCheckbox
          label="County"
          options={countyOptions}
          selectedValues={filters.countyName}
          onChange={(selectedCounty) => setFilters({ ...filters, countyName: selectedCounty })}
        />

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

      {showResults && (
        <>
          <h2>Results</h2>
          <div>
            {responseData.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>

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
