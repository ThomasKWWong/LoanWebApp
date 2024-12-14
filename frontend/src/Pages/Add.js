// src/pages/AddPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate

const AddPage = () => {
  const [formData, setFormData] = useState({
    countyName: "",
    msamd: "",
    tractToMsamdIncome: "",
    loanType: "",
    loanPurpose: "",
    propertyType: "",
    ownerOccupied: "",
  });

  const [countyOptions, setCountyOptions] = useState([]);
  const [msamdOptions, setMsamdOptions] = useState([]);
  
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchMsamdOptions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/msamd');
        const data = await response.json();
        setMsamdOptions(data);
      } catch (error) {
        console.error('Error fetching MSAMD options:', error);
        setMsamdOptions([
          'Camden - NJ',
          'Ocean City - NJ',
          'New York, Jersey City',
          'White Plains - NY, NJ',
          'Newark - NJ, PA',
          'Atlantic City, Hammonton - NJ',
          'Trenton - NJ','Vineland, Bridgeton - NJ',
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
          'Camden County',
          'Cape May County',
          'Monmouth County',
          'Bergen County',
          'Ocean County',
          'Union County',
          'Somerset County',
          'Essex County','Burlington County',
          'Gloucester County',
          'Middlesex County',
          'Mercer County',
          'Morris County','Atlantic County',
          'Sussex County','Passaic County',
          'Warren County',
          'Hudson County',
          'Salem County',
          'Hunterdon County',
          'Cumberland County'
        ]);
      }
    };

    fetchMsamdOptions();
    fetchCountyOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    // Send the data to the backend
    fetch("http://localhost:8080/api/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json(); // Parse JSON if the response is JSON
        }
        return response.text(); // Otherwise, treat it as plain text
      })
      .then((data) => {
        console.log("Response from backend:", data);
        alert("Data successfully added!");
        
        // Reset form
        setFormData({
          countyName: "",
          msamd: "",
          tractToMsamdIncome: "",
          loanType: "",
          loanPurpose: "",
          propertyType: "",
          ownerOccupied: "",
        });

        // Redirect to the filter page ("/")
        navigate("/"); // Redirecting to filter page after successful form submission
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });
  };

  const handleBackToFilter = () => {
    navigate("/"); // Navigate to the filter page when clicked
  };

  return (
    <div>
      {/* Back to Filter Button */}
      <button onClick={handleBackToFilter}>Back to Filter</button>
      
      <h1>Add New Record</h1>
      <form onSubmit={handleSubmit}>
        
        {/* County Name Dropdown */}
        <div>
          <label>County Name:</label>
          <select
            name="countyName"
            value={formData.countyName}
            onChange={handleInputChange}
            required
          >
            <option value="">Select County</option>
            {countyOptions.map((county, index) => (
              <option key={index} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>

        {/* MSAMD Dropdown */}
        <div>
          <label>MSAMD:</label>
          <select
            name="msamd"
            value={formData.msamd}
            onChange={handleInputChange}
            required
          >
            <option value="">Select MSAMD</option>
            {msamdOptions.map((msamd, index) => (
              <option key={index} value={msamd}>
                {msamd}
              </option>
            ))}
          </select>
        </div>

        {/* Applicant Income */}
        <div>
          <label>Applicant Income:</label>
          <input
            type="number"
            name="tractToMsamdIncome"
            value={formData.tractToMsamdIncome}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Loan Type */}
        <div>
          <label>Loan Type:</label>
          <select
            name="loanType"
            value={formData.loanType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select</option>
            <option value="1">Conventional</option>
            <option value="2">FHA-insured</option>
            <option value="3">VA-guaranteed</option>
            <option value="4">FSA/RHS</option>
          </select>
        </div>

        {/* Loan Purpose */}
        <div>
          <label>Loan Purpose:</label>
          <select
            name="loanPurpose"
            value={formData.loanPurpose}
            onChange={handleInputChange}
            required
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
            value={formData.propertyType}
            onChange={handleInputChange}
            required
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
            value={formData.ownerOccupied}
            onChange={handleInputChange}
            required
          >
            <option value="">Select</option>
            <option value="1">Owner-occupied</option>
            <option value="2">Not owner-occupied</option>
            <option value="3">Not applicable</option>
          </select>
        </div>

        <button type="submit">Add Record</button>
      </form>
    </div>
  );
};

export default AddPage;
