import axios from 'axios';

// Test claim data - using the first Ganache account
const testClaim = {
  doctorName: "Dr. Smith",
  patientName: "John Doe",
  doctorId: "12345",
  patientId: "67890",
  diagnosis: "Common Cold",
  treatment: "Rest and fluids",
  claimAmount: "150.00",
  description: "Treatment for common cold",
  reportCID: "Qm" + Math.random().toString(36).substring(2, 46), // Generate a unique CID for testing
  walletAddress: "0x854a4109D956F963eC4BE0749556e40490E550cD" // Use the first Ganache account
};

async function testClaimSubmission() {
  try {
    console.log('Submitting test claim...');
    console.log('Claim data:', testClaim);
    
    const response = await axios.post('http://localhost:5000/api/_claims/submit', testClaim);
    console.log('Claim submission response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error submitting claim:', error.response.data);
    } else {
      console.error('Error submitting claim:', error.message);
    }
  }
}

testClaimSubmission();