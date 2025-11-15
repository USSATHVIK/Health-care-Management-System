import React, { useState, useEffect } from 'react';
import axios from 'axios';

const initialApprovedClaims = [
  {
    id: 1,
    title: 'Claim 001',
    approvalDate: '2024-11-01',
    claimAmount: 5000,
    insurerContribution: 4500,
    patientResponsibility: 500,
    paymentStatus: 'Pending',
    auditTrail: [
      { action: 'Claim Approved', timestamp: '2024-11-01 10:30' },
      { action: 'Payment Initiated', timestamp: '2024-11-02 14:00' },
    ],
  },
  {
    id: 2,
    title: 'Claim 002',
    approvalDate: '2024-11-03',
    claimAmount: 8000,
    insurerContribution: 7000,
    patientResponsibility: 1000,
    paymentStatus: 'Processed',
    auditTrail: [
      { action: 'Claim Approved', timestamp: '2024-11-03 09:00' },
      { action: 'Payment Processed', timestamp: '2024-11-04 16:00' },
    ],
  },
];

const ApprovedClaims = () => {
  const [approvedClaims, setApprovedClaims] = useState([]);
  const [blockchainInfo, setBlockchainInfo] = useState({});

  // Fetch approved claims from the API
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/claims/approved', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data && response.data.length > 0) {
          setApprovedClaims(response.data); // Set the API data if available
        } else {
          setApprovedClaims([]); // Empty array if no claims
        }
      } catch (error) {
        console.error('Error fetching claims:', error);
        setApprovedClaims([]); // Empty array on error
      }
    };

    fetchClaims();
  }, []);

  // Handle payment processing action
  const handlePaymentAction = async (claimId, approvalStatus) => {
    try {
      const token = localStorage.getItem('token');
      // Find the claim to get the correct claimId
      const claim = approvedClaims.find(c => c.id === claimId || c.claimId === claimId);
      const actualClaimId = claim?.claimId || claimId; // Use claimId field if available, otherwise use the id
      
      const response = await axios.post(
        'http://localhost:5001/api/claims/approved/approve',
        {
          claimId: actualClaimId, // Send the claimId field from the database
          approvalStatus: 'Processed'
          // Removed doctorId as it's not needed for insurer payment processing
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200 && response.data.claim) {
        const updatedClaim = response.data.claim;

        // Update the claim in the state
        setApprovedClaims((prevClaims) =>
          prevClaims.map((claim) =>
            claim.id === claimId || claim.claimId === claimId
              ? { ...claim, paymentStatus: 'Processed' }
              : claim
          )
        );

        // Set blockchain transaction info
        const transaction = {
          status: 'Transaction Successful',
          transactionHash: updatedClaim.transactionHash || `0x${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toLocaleString(),
        };

        setBlockchainInfo((prev) => ({ ...prev, [claimId]: transaction }));
        alert('Payment processed successfully!');
      } else {
        console.error('Error processing payment:', response.data.message);
        alert(response.data.message || 'Error processing payment');
      }
    } catch (error) {
      console.error('Error processing claim approval:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-teal-600">Approved Claims</h2>
      <div className="mt-4 space-y-4">
        {approvedClaims.map((claim) => (
          <div key={claim.id} className="border p-4 rounded shadow-sm">
            <h3 className="text-xl font-semibold">{claim.title}</h3>
            <p>Approval Date: <span className="text-gray-700">{claim.approvalDate}</span></p>
            <p>Claim Amount: <span className="text-gray-700">₹{claim.claimAmount?.toLocaleString('en-IN') || 0}</span></p>
            <p>Insurer Contribution: <span className="text-gray-700">₹{claim.insurerContribution?.toLocaleString('en-IN') || 0}</span></p>
            <p>Patient Responsibility: <span className="text-gray-700">₹{claim.patientResponsibility?.toLocaleString('en-IN') || 0}</span></p>
            <p>Payment Status: <span className="text-gray-700">{claim.paymentStatus}</span></p>

            {/* Action to Process Payment */}
            {claim.paymentStatus === 'Pending' && (
              <div className="mt-4 space-x-4">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={() => handlePaymentAction(claim.id, 'Processed')}
                >
                  Mark as Processed
                </button>
              </div>
            )}

            {/* Settlement Tracking (Blockchain Info) */}
            {blockchainInfo[claim.id] && (
              <div className="mt-4 p-2 border bg-gray-100 rounded">
                <p><strong>Blockchain Status:</strong> {blockchainInfo[claim.id].status}</p>
                <p><strong>Transaction Hash:</strong> {blockchainInfo[claim.id].transactionHash}</p>
                <p><strong>Timestamp:</strong> {blockchainInfo[claim.id].timestamp}</p>
              </div>
            )}

            {/* Audit Trail */}
            <div className="mt-4">
              <h4 className="font-semibold text-lg">Audit Trail</h4>
              <ul className="list-disc pl-5">
                {claim.auditTrail.map((log, index) => (
                  <li key={index}>
                    {log.action} - <span className="text-gray-500">{log.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Report (CID fetch) */}
            <div className="mt-4">
              <h4 className="font-semibold text-lg">Report</h4>
              {claim.reportCID && (
                <a
                  href={`https://ipfs.io/ipfs/${claim.reportCID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Report
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovedClaims;