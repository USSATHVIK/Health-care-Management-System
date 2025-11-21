import React, { useState, useEffect } from 'react';
import { rejectClaim } from './api';

const PendingClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState({}); // Track loading state per claim
  const [rejectingClaims, setRejectingClaims] = useState({}); // Track rejecting state per claim
  const [blockchainInfo, setBlockchainInfo] = useState({});

  const formatStatus = (value) => {
    if (!value) return 'N/A';
    return value
      .toString()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isReadyForInsurerAction = (claim) => {
    return (
      claim?.currentStage === 'insurer' &&
      claim?.doctorApprovalStatus === 'approved' &&
      claim?.insurerApprovalStatus === 'pending'
    );
  };

  useEffect(() => {
    // Fetch the pending claims data from your backend
    const fetchPendingClaims = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/claims/pending/pending?stage=insurer', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data && data.pendingClaims) {
          setClaims(data.pendingClaims);  // Set the claims array from backend
        } else if (data && Array.isArray(data)) {
          setClaims(data);
        } else {
          console.error('Invalid data format:', data);
        }
      } catch (error) {
        console.error('Error fetching pending claims:', error);
      }
    };

    fetchPendingClaims();
  }, []);

  // Simulate blockchain transaction (for demo purposes)
  const getBlockchainTransaction = (claimId) => {
    return {
      status: 'Transaction Pending',
      transactionHash: `0x${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleString(),
    };
  };

  const handleClaimValidation = async (claimId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set loading state for this specific claim
    setLoadingClaims((prev) => ({ ...prev, [claimId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      // Make a POST request to the backend for claim validation
      const response = await fetch(`http://localhost:5001/api/claims/pending/validate/${claimId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Get blockchain transaction details from the response
        const blockchainTransaction = {
          status: data.blockchainVerified ? 'Transaction Successful' : 'Database Verified',
          transactionHash: data.transactionHash && data.transactionHash !== 'N/A' ? data.transactionHash : 'N/A',
          timestamp: new Date().toLocaleString(),
        };

        // Update blockchain info and the status of the claim
        setBlockchainInfo((prevInfo) => ({
          ...prevInfo,
          [claimId]: blockchainTransaction,
        }));

        // Update claim status to 'verified' and remove from pending list
        setClaims((prevClaims) =>
          prevClaims.filter((claim) => claim.claimId !== claimId)
        );
        alert(data.message || 'Claim validated successfully!');
      } else {
        const errorMsg = data.error || data.message || data.details || 'Validation failed.';
        alert(`Validation failed: ${errorMsg}`);
        console.error('Validation error details:', data);
      }
    } catch (error) {
      console.error('Error validating claim:', error);
      alert('An error occurred while validating the claim.');
    } finally {
      // Clear loading state for this specific claim
      setLoadingClaims((prev) => {
        const newState = { ...prev };
        delete newState[claimId];
        return newState;
      });
    }
  };

  const handleReject = async (claimId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prompt for rejection reason
    const rejectionReason = prompt('Please provide a reason for rejection:', 'Claim rejected by insurer');
    if (!rejectionReason) {
      return; // User cancelled
    }

    // Set rejecting state for this specific claim
    setRejectingClaims((prev) => ({ ...prev, [claimId]: true }));

    try {
      // Find the claim to get the correct claimId format
      const claim = claims.find(c => (c.claimId === claimId) || (c.id === claimId));
      const actualClaimId = claim?.claimId || claimId;
      
      await rejectClaim(actualClaimId, rejectionReason);
      
      // Remove rejected claim from the list
        setClaims((prevClaims) =>
          prevClaims.filter((claim) => 
            (claim.claimId !== actualClaimId) && (claim.id !== actualClaimId)
          )
        );
        alert('Claim rejected successfully!');
    } catch (error) {
      console.error('Error rejecting claim:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error rejecting claim. Please try again.';
      alert(errorMsg);
    } finally {
      // Clear rejecting state for this specific claim
      setRejectingClaims((prev) => {
        const newState = { ...prev };
        delete newState[claimId];
        return newState;
      });
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-teal-600">Pending Claims</h2>
      <div className="mt-4 space-y-4">
        {claims.map((claim) => (
          <div key={claim.claimId} className="border p-4 rounded shadow-sm">
            <h3 className="text-xl font-semibold">{`Claim ID: ${claim.claimId}`}</h3>
            <p>Status: <span className="text-gray-700">{formatStatus(claim.status)}</span></p>
            <p className="text-sm text-gray-500">Current Stage: {formatStatus(claim.currentStage)}</p>
            <p className="text-sm text-gray-500">Doctor Review: {formatStatus(claim.doctorApprovalStatus)}</p>
            <p className="text-sm text-gray-500">Insurer Review: {formatStatus(claim.insurerApprovalStatus)}</p>
            <p className="text-sm text-gray-500">Patient: {claim.patientName}</p>
            <p className="text-sm text-gray-500">Doctor: {claim.doctorName}</p>
            <p className="text-sm text-gray-500">Amount: ₹{claim.amount ? (typeof claim.amount === 'number' ? claim.amount.toLocaleString('en-IN') : claim.amount) : 0}</p>
            <p className="text-sm text-gray-500">Rejection Reason: {claim.rejectionReason || 'N/A'}</p>
            <p className="text-sm text-gray-500">Dispute Message: {claim.disputeMessage || 'N/A'}</p>
            <p className="text-sm text-gray-500">Notes: {claim.notes || 'N/A'}</p>

            {/* Documents */}
            {claim.documents && claim.documents.length > 0 && (
              <div>
                <h4 className="mt-2 text-lg font-semibold">Documents:</h4>
                <ul>
                  {claim.documents.map((doc, index) => (
                    <li key={index} className="text-blue-600">{doc}</li> // Assuming documents are URLs or file names
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 space-x-4">
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                onClick={(e) => handleClaimValidation(claim.claimId, e)}
                disabled={
                  !isReadyForInsurerAction(claim) ||
                  claim.isVerified ||
                  loadingClaims[claim.claimId] ||
                  rejectingClaims[claim.claimId]
                }
              >
                {loadingClaims[claim.claimId] ? 'Validating...' : 'Verify & Approve'}
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                onClick={(e) => handleReject(claim.claimId, e)}
                disabled={
                  !isReadyForInsurerAction(claim) ||
                  claim.status === 'rejected' ||
                  loadingClaims[claim.claimId] ||
                  rejectingClaims[claim.claimId]
                }
              >
                {rejectingClaims[claim.claimId] ? 'Rejecting...' : 'Reject Claim'}
              </button>
            </div>

            {/* Blockchain Transparency */}
            {blockchainInfo[claim.claimId] && (
              <div className="mt-4 p-2 border bg-gray-100 rounded">
                <p><strong>Blockchain Status:</strong> {blockchainInfo[claim.claimId].status}</p>
                <p><strong>Transaction Hash:</strong> {blockchainInfo[claim.claimId].transactionHash}</p>
                <p><strong>Timestamp:</strong> {blockchainInfo[claim.claimId].timestamp}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingClaims;