// // Example mock data (to be replaced with DB logic if you are using a real database)
// const claims = {
//     '12345': { status: 'Processing' },
//     '67890': { status: 'Approved' },
//     '11223': { status: 'Denied' },
//     '44556': { status: 'Under Review' },
//   };
  
//   // Controller function to get claim status by claimId
//   const     getInsuranceClaimStatus = (req, res) => {
//     const { claimId } = req.params;
  
//     // Check if the claimId exists in the mock claims data
//     if (claims[claimId]) {
//       return res.json({ status: claims[claimId].status });
//     }
  
//     // If the claimId doesn't exist
//     return res.status(404).json({ message: 'Claim ID not found' });
//   };
  
//   export { getInsuranceClaimStatus };
  


import Claim from '../models/Claim.js';

const getInsuranceClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;  // Get raw claimId from the route params

    // Find the claim in the database
    const claim = await Claim.findOne({ claimId });

    // If the claimId is not found
    if (!claim) {
      return res.status(404).json({ message: 'Claim ID not found' });
    }

    // Return the claim status
    return res.json({ 
      status: claim.status,
      claimId: claim.claimId,
      patientName: claim.patientName,
      doctorName: claim.doctorName,
      amount: claim.amount
    });
  } catch (error) {
    console.error('Error fetching claim status:', error);
    return res.status(500).json({ message: 'Error occurred while fetching claim status' });
  }
};

export { getInsuranceClaimStatus };
  
