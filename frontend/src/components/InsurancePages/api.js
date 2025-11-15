import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchClaims = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/claims/pending/pending`, {
      headers: getAuthHeaders()
    });
    return response.data?.pendingClaims || [];
  } catch (error) {
    console.error('Error fetching claims:', error);
    return [];
  }
};

export const approveClaim = async (claimId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/claims/approved/approve`,
      {
        claimId,
        approvalStatus: 'approved'
      },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error approving claim:', error);
    throw error;
  }
};

export const rejectClaim = async (claimId, reason) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/reviewclaims/review/${claimId}`,
      {
        status: 'reject',
        doctorReview: reason
      },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting claim:', error);
    throw error;
  }
};
  