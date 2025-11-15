

import React, { useState, useEffect } from 'react';
import ClaimItem from './ClaimItem';
import ClaimDetailsModal from './ClaimDetailsModal';
import { fetchClaims, approveClaim, rejectClaim } from './api'; // API functions

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch pending claims
  useEffect(() => {
    async function getClaims() {
      setLoading(true);
      try {
        const data = await fetchClaims(); // Fetches pending claims from API
        setClaims(data || []);
      } catch (error) {
        console.error('Error fetching claims:', error);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    }
    getClaims();
  }, []);

  const handleApprove = async (claimId) => {
    try {
      // Find the claim to get the correct claimId format
      const claim = claims.find(c => (c.claimId === claimId) || (c.id === claimId));
      const actualClaimId = claim?.claimId || claimId;
      
      await approveClaim(actualClaimId);
      
      // Remove approved claim from the list
      setClaims(prevClaims => 
        prevClaims.filter(claim => 
          (claim.claimId !== actualClaimId) && (claim.id !== actualClaimId)
        )
      );
      alert('Claim approved successfully!');
    } catch (error) {
      console.error('Error approving claim:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error approving claim. Please try again.';
      alert(errorMsg);
    }
  };

  const handleReject = async (claimId, reason = 'Claim rejected by insurer') => {
    // Prompt for rejection reason
    const rejectionReason = prompt('Please provide a reason for rejection:', reason);
    if (!rejectionReason) {
      return; // User cancelled
    }

    try {
      // Find the claim to get the correct claimId format
      const claim = claims.find(c => (c.claimId === claimId) || (c.id === claimId));
      const actualClaimId = claim?.claimId || claimId;
      
      await rejectClaim(actualClaimId, rejectionReason);
      
      // Remove rejected claim from the list
      setClaims(prevClaims => 
        prevClaims.filter(claim => 
          (claim.claimId !== actualClaimId) && (claim.id !== actualClaimId)
        )
      );
      alert('Claim rejected successfully!');
    } catch (error) {
      console.error('Error rejecting claim:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error rejecting claim. Please try again.';
      alert(errorMsg);
    }
  };

  const openClaimDetails = (claim) => {
    setSelectedClaim(claim);
    setShowClaimDetails(true);
  };

  const closeClaimDetails = () => {
    setShowClaimDetails(false);
    setSelectedClaim(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-teal-600">Claims Management</h2>

      <div className="my-4">
        <input type="text" placeholder="Search claims..." className="p-2 border rounded" />
        {/* Add other filter options as needed */}
      </div>

      {claims.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-600">No pending claims found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <ClaimItem
              key={claim.claimId || claim.id}
              claim={claim}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={openClaimDetails}
            />
          ))}
        </div>
      )}

      {showClaimDetails && (
        <ClaimDetailsModal
          claim={selectedClaim}
          onClose={closeClaimDetails}
        />
      )}
    </div>
  );
};

export default ClaimsManagement;
