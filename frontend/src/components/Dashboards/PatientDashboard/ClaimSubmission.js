import React, { useState, useEffect } from "react";
import axios from "axios";

const pinataUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";

// Function to generate a unique CID for testing purposes
const generateUniqueCID = () => {
  // Generate a random string that looks like an IPFS CID (Qm prefix + 44 random chars)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'Qm'; // IPFS CIDv0 prefix
  
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

const ClaimSubmission = () => {
  const [formData, setFormData] = useState({
    doctorName: "",
    patientName: "",
    doctorId: "",
    patientId: "",
    diagnosis: "",
    treatment: "",
    claimAmount: "",
    description: "",  // Added description field
    report: null,
    ipfsLink: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [useMockIPFS, setUseMockIPFS] = useState(true); // Flag to use mock IPFS for development

  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  // Check if MetaMask is connected
  const checkMetaMaskConnection = async () => {
    if (typeof window.ethereum === 'undefined') {
      setIsMetaMaskConnected(false);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setIsMetaMaskConnected(true);
        setWalletAddress(accounts[0]);
        console.log("MetaMask already connected:", accounts[0]);
      } else {
        setIsMetaMaskConnected(false);
      }
    } catch (error) {
      console.error("Error checking MetaMask connection:", error);
      setIsMetaMaskConnected(false);
    }
  };

  // Handle MetaMask connection
  const connectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("MetaMask is not installed. Please install MetaMask extension from https://metamask.io/");
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts.length === 0) {
        alert("No accounts found. Please create an account in MetaMask.");
        return;
      }

      setIsMetaMaskConnected(true);
      setWalletAddress(accounts[0]);
      console.log("MetaMask connected successfully:", accounts[0]);
    } catch (error) {
      console.error("MetaMask connection error:", error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        alert("MetaMask connection rejected. Please approve the connection request.");
      } else if (error.code === -32002) {
        alert("MetaMask connection request is already pending. Please check your MetaMask extension.");
      } else {
        alert(`Failed to connect to MetaMask: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type. Allowed: PDF, PNG, JPG, WEBP, TXT, DOC, DOCX.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB.");
        return;
      }
      setFormData({ ...formData, report: file });
    }
  };

  const uploadToIPFS = async (file) => {
    // For development, we can use a mock IPFS upload
    if (useMockIPFS) {
      // Simulate IPFS upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Return a unique CID for each upload
      return generateUniqueCID();
    }
    
    // Production IPFS upload
    const ipfsFormData = new FormData();
    ipfsFormData.append("file", file);

    try {
      const response = await axios.post(pinataUrl, ipfsFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
        },
      });
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error("Failed to upload to IPFS. Please try again.");
    }
  };

  const validateForm = () => {
    const {
      doctorName,
      patientName,
      doctorId,
      patientId,
      diagnosis,
      treatment,
      claimAmount,
      description,  // Added description validation
      report,
    } = formData;
    if (
      !doctorName ||
      !patientName ||
      !doctorId ||
      !patientId ||
      !diagnosis ||
      !treatment ||
      !claimAmount ||
      !description ||  // Check if description is provided
      !report
    ) {
      alert("All fields are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!isMetaMaskConnected) {
      alert("MetaMask is not connected. Please connect your MetaMask wallet.");
      return;
    }

    setIsUploading(true);
    let reportHash = "";

    try {
      // Upload the report to IPFS
      reportHash = await uploadToIPFS(formData.report);

      // Generate the IPFS link
      const ipfsLink = `https://ipfs.io/ipfs/${reportHash}`;
      setFormData({ ...formData, ipfsLink });

      // Automatically copy the IPFS link to the clipboard
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(ipfsLink);
          alert("IPFS link copied to clipboard!");
        } else {
          // Fallback: Create a temporary textarea element to copy
          const textarea = document.createElement('textarea');
          textarea.value = ipfsLink;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert("IPFS link copied to clipboard!");
        }
      } catch (clipboardError) {
        console.warn('Failed to copy to clipboard:', clipboardError);
        // Still show the IPFS link even if clipboard copy fails
        alert(`IPFS link: ${ipfsLink}`);
      }

      // Prepare form data to send to backend
      const data = {
        doctorName: formData.doctorName,
        patientName: formData.patientName,
        doctorId: formData.doctorId,
        patientId: formData.patientId,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        claimAmount: formData.claimAmount,
        description: formData.description,  // Include description in the claim data
        reportCID: reportHash, // Store the IPFS CID in the claim data
        walletAddress: walletAddress,  // Include MetaMask wallet address
        reportMime: formData.report?.type || "application/octet-stream",
        reportName: formData.report?.name || "report",
      };

      // Send the claim data to your backend using relative URL (will use proxy)
      const response = await fetch("/api/_claims/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Show success message with blockchain transaction details
        const successMessage = `Claim submitted successfully and stored on the blockchain!\n\nClaim ID: ${result.claimId}\nTransaction Hash: ${result.transactionHash}\n\nYour claim has been successfully recorded on the blockchain and will be reviewed by the insurer.`;
        
        alert(successMessage);
        
        // Reset the form
        setFormData({
          doctorName: "",
          patientName: "",
          doctorId: "",
          patientId: "",
          diagnosis: "",
          treatment: "",
          claimAmount: "",
          description: "",  // Reset description field
          report: null,
          ipfsLink: "",
        });
      } else {
        // Provide more specific error messages
        let errorMessage = result.error || "Failed to submit claim. Please try again.";
        
        if (result.error) {
          if (result.error.includes('duplicate') || result.error.includes('already been used')) {
            errorMessage = "This medical report has already been used for another claim. Please upload a different report or contact support if you believe this is an error.";
          } else if (result.error.includes('Ganache') || result.error.includes('blockchain') || result.error.includes('unavailable') || result.error.includes('connection')) {
            errorMessage = result.error + "\n\nPlease ensure:\n1. Ganache is running on http://localhost:7545\n2. The blockchain network is properly configured\n3. You have sufficient funds in your wallet";
          } else if (result.error.includes('revert')) {
            errorMessage = "There was an issue processing your claim on the blockchain. Please check your information and try again.\n\n" + (result.details || '');
          }
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      // Check if it's a network error (failed to fetch)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        alert("Failed to connect to the server. Please make sure the backend server is running and try again.");
      } else {
        alert(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsUploading(false); // Stop loading
    }
  };

  const handleCheckStatus = async () => {
    const claimId = prompt("Enter the Claim ID to check the status:");
    if (!claimId) {
      alert("Claim ID is required.");
      return;
    }

    try {
      const response = await fetch(
        `/api/_claims/status/${claimId}`
      );
      const result = await response.json();

      if (response.ok) {
        alert(`Claim Status: ${result.status}`);
      } else {
        alert(result.error || "Failed to fetch claim status.");
      }
    } catch (error) {
      console.error("Error checking claim status:", error);
      // Check if it's a network error (failed to fetch)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        alert("Failed to connect to the server. Please make sure the backend server is running and try again.");
      } else {
        alert("Failed to fetch claim status.");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-teal-600 mb-6">Submit a Claim</h1>

      {/* Toggle for mock IPFS (development only) */}
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={useMockIPFS}
            onChange={(e) => setUseMockIPFS(e.target.checked)}
            className="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-gray-700">Use Mock IPFS (Development Mode)</span>
        </label>
      </div>

      {/* MetaMask Connect Button */}
      {!isMetaMaskConnected ? (
        <button
          onClick={connectMetaMask}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md mb-6"
        >
          Connect MetaMask Wallet
        </button>
      ) : (
        <div className="mb-6">
          <p>Connected Wallet Address: {walletAddress}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Doctor Name */}
        <div className="mb-4">
          <label htmlFor="doctorName" className="block text-gray-700 font-medium mb-2">
            Doctor Name
          </label>
          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Patient Name */}
        <div className="mb-4">
          <label htmlFor="patientName" className="block text-gray-700 font-medium mb-2">
            Patient Name
          </label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Doctor ID */}
        <div className="mb-4">
          <label htmlFor="doctorId" className="block text-gray-700 font-medium mb-2">
            Doctor ID
          </label>
          <input
            type="text"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Patient ID */}
        <div className="mb-4">
          <label htmlFor="patientId" className="block text-gray-700 font-medium mb-2">
            Patient ID
          </label>
          <input
            type="text"
            name="patientId"
            value={formData.patientId}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Diagnosis */}
        <div className="mb-4">
          <label htmlFor="diagnosis" className="block text-gray-700 font-medium mb-2">
            Diagnosis
          </label>
          <input
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Treatment */}
        <div className="mb-4">
          <label htmlFor="treatment" className="block text-gray-700 font-medium mb-2">
            Treatment
          </label>
          <input
            type="text"
            name="treatment"
            value={formData.treatment}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Claim Amount */}
        <div className="mb-4">
          <label htmlFor="claimAmount" className="block text-gray-700 font-medium mb-2">
            Claim Amount
          </label>
          <input
            type="number"
            name="claimAmount"
            value={formData.claimAmount}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
            rows="3"
          ></textarea>
        </div>

        {/* Report File */}
        <div className="mb-4">
          <label htmlFor="report" className="block text-gray-700 font-medium mb-2">
            Upload Report (PDF, Images, TXT, DOC, DOCX)
          </label>
          <input
            type="file"
            name="report"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Submit Claim"}
        </button>
      </form>

      <button
        onClick={handleCheckStatus}
        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md mt-4"
      >
        Check Claim Status
      </button>
    </div>
  );
};

export default ClaimSubmission;