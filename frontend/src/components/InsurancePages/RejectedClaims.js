// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const RejectedClaims = () => {
//   const [rejectedClaims, setRejectedClaims] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [disputeStatus, setDisputeStatus] = useState(null);
//   const [disputeMessage, setDisputeMessage] = useState("");
//   const [analytics, setAnalytics] = useState({ rejectionReasons: [], fraudRisk: '' });

//   // Fetch the rejected claims and analytics from the backend (API)
//   useEffect(() => {
//     const fetchRejectedClaims = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/claims/rejected'); // API endpoint to get rejected claims
//         setRejectedClaims(response.data);
//       } catch (error) {
//         console.error('Error fetching rejected claims:', error);
//       }
//     };

//     const fetchAnalytics = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/claims/analytics'); // API endpoint to get rejection analytics
//         setAnalytics(response.data);
//       } catch (error) {
//         console.error('Error fetching rejection analytics:', error);
//       }
//     };

//     fetchRejectedClaims();
//     fetchAnalytics();
//   }, []);

//   // Handle the dispute process
//   const handleDispute = async (claimId) => {
//     if (!disputeMessage) {
//       alert('Please provide a dispute message');
//       return;
//     }
//     try {
//       const response = await axios.post(`/api/claims/dispute/${claimId}`, {
//         message: disputeMessage,  // Dispute message entered by the user
//       });
//       setDisputeStatus(response.data.status);
//     } catch (error) {
//       console.error("Error submitting dispute:", error);
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h2 className="text-3xl font-bold text-teal-600">Rejected Claims</h2>
      
//       {rejectedClaims.length === 0 ? (
//         <p>No rejected claims found.</p>
//       ) : (
//         <div>
//           <div className="space-y-4">
//             {rejectedClaims.map((claim) => (
//               <div key={claim.id} className="border border-gray-300 p-4 rounded-md">
//                 <h3 className="font-bold">{claim.patientName}</h3>
//                 <p><strong>Claim ID:</strong> {claim.id}</p>
//                 <p><strong>Rejection Reason:</strong> {claim.rejectionReason}</p>
//                 <p><strong>Amount Claimed:</strong> ${claim.amount}</p>
//                 <p><strong>Rejection Date:</strong> {new Date(claim.rejectionDate).toLocaleDateString()}</p>
//                 <p><strong>Notes:</strong> {claim.notes}</p>
//                 <div className="mt-2">
//                   <button
//                     className="bg-blue-500 text-white p-2 rounded-md"
//                     onClick={() => handleDispute(claim.id)}
//                   >
//                     Dispute Claim
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Dispute Status */}
//           {disputeStatus && (
//             <div className="mt-4 p-4 border border-green-300 rounded-md bg-green-50">
//               <strong>Dispute Status: </strong> {disputeStatus}
//             </div>
//           )}

//           {/* Dispute Message Section */}
//           <div className="mt-4">
//             <h3 className="text-xl font-semibold">Submit Dispute Message</h3>
//             <textarea
//               className="w-full border border-gray-300 p-2 mt-2"
//               rows="4"
//               placeholder="Provide additional details for the dispute..."
//               value={disputeMessage}
//               onChange={(e) => setDisputeMessage(e.target.value)}
//             ></textarea>
//             <button
//               className="mt-2 bg-blue-500 text-white p-2 rounded-md"
//               onClick={() => handleDispute(1)} // Pass dynamic claimId here (you'll need the selected claimId)
//             >
//               Submit Dispute
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Rejection Analytics */}
//       <div className="mt-8">
//         <h3 className="text-xl font-semibold">Rejected Claims Analytics</h3>
//         <div className="space-y-2">
//           {/* Render rejection reason trends dynamically */}
//           <div className="border border-gray-300 p-4 rounded-md">
//             <strong>Common Rejection Reasons:</strong>
//             <ul>
//               {analytics.rejectionReasons.length > 0 ? (
//                 analytics.rejectionReasons.map((reason, index) => (
//                   <li key={index}>{reason.name}: {reason.count} claims</li>
//                 ))
//               ) : (
//                 <li>No data available</li>
//               )}
//             </ul>
//           </div>

//           {/* Display Fraud Risk Trend dynamically */}
//           <div className="border border-gray-300 p-4 rounded-md">
//             <strong>Fraud Risk Trend:</strong>
//             <p>{analytics.fraudRisk || 'No fraud risk data available'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RejectedClaims;
  


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpring, animated } from '@react-spring/web';

const RejectedClaims = () => {
  const [rejectedClaims, setRejectedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disputeStatus, setDisputeStatus] = useState(null);
  const [disputeMessage, setDisputeMessage] = useState('');
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [analytics, setAnalytics] = useState({ rejectionReasons: [], fraudRisk: '' });

  // Fetch the rejected claims and analytics from the backend (API)
  useEffect(() => {
    const fetchRejectedClaims = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/claims/rejected', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Map the data to match frontend expectations
        const mappedClaims = (response.data || []).map(claim => ({
          id: claim.claimId || claim._id?.toString() || '',
          claimId: claim.claimId || claim._id?.toString() || '',
          patientName: claim.patientName || 'N/A',
          doctorName: claim.doctorName || 'N/A',
          amount: claim.amount || 0,
          rejectionReason: claim.rejectionReason || claim.doctorReview || 'No reason provided',
          rejectionDate: claim.updatedAt || claim.createdAt || new Date(),
          notes: claim.notes || claim.description || '',
          status: claim.status || 'rejected',
          disputeMessage: claim.disputeMessage || '',
          transactionHash: claim.transactionHash || 'N/A',
          reportCID: claim.reportCID || ''
        }));
        
        setRejectedClaims(mappedClaims);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rejected claims:', error);
        setRejectedClaims([]);
        setLoading(false);
        // Show error message to user
        if (error.response?.status === 401) {
          alert('Please login to view rejected claims');
        } else if (error.response?.status === 404) {
          // No rejected claims found, which is fine
          console.log('No rejected claims found');
        } else {
          console.error('Unexpected error:', error);
        }
      }
    };

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/claims/rejected', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Calculate analytics from rejected claims
        const rejectedClaims = response.data || [];
        const rejectionReasons = {};
        
        rejectedClaims.forEach(claim => {
          const reason = claim.rejectionReason || claim.doctorReview || 'No reason provided';
          rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
        });
        
        const analyticsData = {
          rejectionReasons: Object.entries(rejectionReasons)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5), // Top 5 reasons
          fraudRisk: rejectedClaims.length > 0 
            ? `${((rejectedClaims.filter(c => c.disputeMessage).length / rejectedClaims.length) * 100).toFixed(1)}% of rejected claims are disputed`
            : 'No fraud risk data available'
        };
        
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching rejection analytics:', error);
        setAnalytics({ rejectionReasons: [], fraudRisk: 'No fraud risk data available' });
        // Analytics error is not critical, so we don't show an alert
      }
    };

    fetchRejectedClaims();
    fetchAnalytics();
  }, []);

  // Handle the dispute process
  const handleDispute = async (claimId) => {
    if (!disputeMessage || disputeMessage.trim() === '') {
      alert('Please provide a dispute message');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to submit a dispute');
        return;
      }

      // Find the claim to get the correct claimId format
      const claim = rejectedClaims.find(c => (c.claimId === claimId) || (c.id === claimId));
      const actualClaimId = claim?.claimId || claimId;

      const response = await axios.post(
        `http://localhost:5001/api/claims/dispute/${actualClaimId}`,
        {
          message: disputeMessage.trim(),  // Dispute message entered by the user
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setDisputeStatus(response.data.status || 'Dispute submitted successfully');
      setDisputeMessage(''); // Clear the message after successful submission
      setSelectedClaimId(null); // Close the dispute form
      
      // Remove the disputed claim from rejected claims list since status changed to 'under review'
      setRejectedClaims(prevClaims =>
        prevClaims.filter(c => 
          (c.claimId !== actualClaimId) && (c.id !== actualClaimId)
        )
      );
      
      alert('Dispute submitted successfully! The claim status has been updated to "under review" and will be reviewed again.');
    } catch (error) {
      console.error('Error submitting dispute:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Error submitting dispute. Please try again.';
      alert(errorMsg);
    }
  };

  // Animation for claim container
  const claimContainerAnimation = useSpring({
    opacity: loading ? 0 : 1,
    transform: loading ? 'translateY(50px)' : 'translateY(0px)',
    config: { tension: 170, friction: 26 }
  });

  // Animation for the dispute button
  const disputeButtonAnimation = useSpring({
    opacity: disputeStatus ? 0 : 1,
    transform: disputeStatus ? 'scale(0.8)' : 'scale(1)',
    config: { tension: 200, friction: 15 }
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rejected claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-teal-600 mb-6">Rejected Claims</h2>
      {rejectedClaims.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 text-lg">No rejected claims found.</p>
        </div>
      ) : (
        <animated.div style={claimContainerAnimation}>
          <div className="space-y-4 mb-6">
            {rejectedClaims.map((claim) => (
              <div key={claim.id || claim.claimId} className="bg-white border border-gray-300 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">{claim.patientName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600"><strong>Claim ID:</strong></p>
                        <p className="font-semibold">{claim.claimId || claim.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><strong>Doctor/Provider:</strong></p>
                        <p className="font-semibold">{claim.doctorName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><strong>Amount Claimed:</strong></p>
                        <p className="font-semibold text-red-600">₹{claim.amount?.toLocaleString('en-IN') || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><strong>Rejection Date:</strong></p>
                        <p className="font-semibold">{new Date(claim.rejectionDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-600"><strong>Rejection Reason:</strong></p>
                      <p className="font-semibold text-red-700 bg-red-50 p-2 rounded mt-1">{claim.rejectionReason}</p>
                    </div>
                    {claim.notes && (
                      <div className="mt-2">
                        <p className="text-gray-600"><strong>Notes:</strong></p>
                        <p className="text-gray-700">{claim.notes}</p>
                      </div>
                    )}
                    {claim.disputeMessage && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded">
                        <p className="text-gray-600"><strong>Dispute Message:</strong></p>
                        <p className="text-gray-700">{claim.disputeMessage}</p>
                        <p className="text-sm text-gray-500 mt-1">Status: Under Review</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {!claim.disputeMessage && (
                  <animated.div style={disputeButtonAnimation} className="mt-4">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                      onClick={() => {
                        setSelectedClaimId(claim.claimId || claim.id);
                        setDisputeMessage('');
                      }}
                    >
                      Dispute Claim 🧐
                    </button>
                  </animated.div>
                )}
              </div>
            ))}
          </div>

          {/* Dispute Status */}
          {disputeStatus && (
            <div className="mt-4 p-4 border border-green-300 rounded-lg bg-green-50">
              <strong>Dispute Status: </strong> {disputeStatus} 😊
            </div>
          )}

          {/* Dispute Message Section */}
          {selectedClaimId && (
            <div className="mt-6 bg-white border border-gray-300 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Submit Dispute Message</h3>
              <p className="text-sm text-gray-600 mb-2">Claim ID: {selectedClaimId}</p>
              <textarea
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Provide additional details for the dispute. Explain why you believe this claim should be reconsidered..."
                value={disputeMessage}
                onChange={(e) => setDisputeMessage(e.target.value)}
              ></textarea>
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                  onClick={() => handleDispute(selectedClaimId)}
                  disabled={!disputeMessage || disputeMessage.trim() === ''}
                >
                  Submit Dispute 🚀
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                  onClick={() => {
                    setSelectedClaimId(null);
                    setDisputeMessage('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </animated.div>
      )}

      {/* Rejection Analytics */}
      {rejectedClaims.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold text-teal-600 mb-4">Rejected Claims Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Render rejection reason trends dynamically */}
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <strong className="text-lg text-gray-800">Common Rejection Reasons:</strong>
              <ul className="mt-2 space-y-2">
                {analytics.rejectionReasons.length > 0 ? (
                  analytics.rejectionReasons.map((reason, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{reason.name}</span>
                      <span className="font-semibold text-red-600">
                        {reason.count} {reason.count === 1 ? 'claim' : 'claims'} ⚠️
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No data available</li>
                )}
              </ul>
            </div>

            {/* Display Fraud Risk Trend dynamically */}
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <strong className="text-lg text-gray-800">Fraud Risk Trend:</strong>
              <p className="mt-2 text-gray-700">{analytics.fraudRisk || 'No fraud risk data available'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedClaims;
