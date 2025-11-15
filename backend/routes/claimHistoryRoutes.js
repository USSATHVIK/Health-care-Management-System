import express from 'express';
import Claim from '../models/Claim.js';

const router = express.Router();

// Route to get claim history with query parameters
router.get('/history', async (req, res) => {
  try {
    const { patientName, provider, status, fromDate, toDate, minAmount, maxAmount } = req.query;

    // Build query object
    const query = {};

    // Add filters to query
    if (status) {
      query.status = status.toLowerCase();
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Fetch all claims from database
    let claims = await Claim.find(query).sort({ createdAt: -1 });

    // Apply client-side filters for patientName and provider (since they might be in nested fields)
    let filteredClaims = claims.map(claim => ({
      id: claim.claimId || claim._id.toString(),
      claimId: claim.claimId,
      status: claim.status || 'pending',
      patientName: claim.patientName || 'N/A',
      provider: claim.doctorName || 'N/A',
      claimAmount: claim.amount || 0,
      diagnosis: claim.diagnosis || claim.description || 'N/A',
      procedureCodes: claim.procedureCodes || [],
      treatmentDate: claim.createdAt ? claim.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      transactionHash: claim.transactionHash || 'N/A',
      rejectionReason: claim.doctorReview || claim.rejectionReason || '',
      paymentStatus: claim.status === 'approved' ? 'Paid' : claim.status === 'rejected' ? 'Rejected' : 'Pending',
      documentLink: claim.reportCID ? `https://ipfs.io/ipfs/${claim.reportCID}` : '',
      doctorName: claim.doctorName || 'N/A',
      description: claim.description || 'N/A'
    }));

    // Apply text-based filters
    if (patientName) {
      filteredClaims = filteredClaims.filter(claim =>
        claim.patientName.toLowerCase().includes(patientName.toLowerCase())
      );
    }
    if (provider) {
      filteredClaims = filteredClaims.filter(claim =>
        claim.provider.toLowerCase().includes(provider.toLowerCase())
      );
    }

    res.json(filteredClaims);
  } catch (error) {
    console.error('Error fetching claim history:', error);
    res.status(500).json({ error: 'Failed to fetch claim history' });
  }
});

export default router;
