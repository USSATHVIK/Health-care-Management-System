import express from 'express';
import Claim from '../models/Claim.js'; // Model for claim details
import { approveClaimOnBlockchain } from './contractFunctions.js'; // Smart contract interaction function
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to handle ObjectId validation
const validateObjectId = (id, fieldName) => {
  try {
    if (!id) {
      return null;
    }
    // Check if it's a valid ObjectId format
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Route: Get approved claims
router.get('/', async (req, res) => {
  try {
    // Find all claims with status 'approved'
    const approvedClaims = await Claim.find({ status: 'approved' });
    
    if (approvedClaims.length === 0) {
      return res.status(200).json([]);
    }
    
    // Format the claims for the frontend
    const formattedClaims = approvedClaims.map(claim => ({
      id: claim._id,
      claimId: claim.claimId,
      title: `Claim ${claim._id.toString().substring(0, 6)}`,
      approvalDate: claim.updatedAt ? claim.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      claimAmount: claim.amount,
      insurerContribution: claim.amount * 0.9, // 90% covered by insurer
      patientResponsibility: claim.amount * 0.1, // 10% patient responsibility
      paymentStatus: 'Pending',
      auditTrail: claim.auditTrail || [],
      reportCID: claim.reportCID || '',
    }));
    
    res.status(200).json(formattedClaims);
  } catch (error) {
    console.error('Error fetching approved claims:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route: Approve a claim (for processing payment on approved claims)
router.post('/approve', async (req, res) => {
  console.log("Inside Approving claim... route");
  console.log("Incoming request body:", req.body);

  const { claimId, doctorId, approvalStatus } = req.body;
  if (!claimId || !approvalStatus) {
    return res.status(400).json({ message: 'Missing required fields: claimId and approvalStatus are required' });
  }

  try {
    // Step 1: Find the claim by claimId (string) or _id (ObjectId)
    let claim = null;
    
    // Try to find by claimId field first (string UUID)
    claim = await Claim.findOne({ claimId: claimId });
    
    // If not found, try to find by _id if claimId is a valid ObjectId
    if (!claim) {
      const claimObjectId = validateObjectId(claimId, 'claimId');
      if (claimObjectId) {
        claim = await Claim.findById(claimObjectId);
      }
    }

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Step 2: Validate the claim status - allow updating approved claims to processed
    if (claim.status !== 'approved' && claim.status !== 'pending') {
      return res.status(400).json({ message: `Claim status is '${claim.status}'. Cannot process.` });
    }

    // Step 3: Try blockchain interaction (optional - don't fail if blockchain is unavailable)
    let blockchainSuccess = false;
    try {
      const approvalResult = await approveClaimOnBlockchain(claim.claimId || claim._id.toString(), approvalStatus);
      blockchainSuccess = approvalResult.success;
    } catch (blockchainError) {
      console.warn('Blockchain interaction failed, proceeding with database update:', blockchainError.message);
      blockchainSuccess = false;
    }

    // Step 4: Update the status in the database
    if (approvalStatus === 'Processed' || approvalStatus === 'processed') {
      claim.status = 'approved';
      claim.paymentStatus = 'Processed';
    } else {
      claim.status = approvalStatus;
    }

    // Add to audit trail if it exists
    if (claim.auditTrail && Array.isArray(claim.auditTrail)) {
      claim.auditTrail.push({
        action: `Claim ${approvalStatus}`,
        timestamp: new Date().toLocaleString(),
      });
    }

    await claim.save();

    return res.status(200).json({ 
      message: `Claim successfully ${approvalStatus.toLowerCase()}`,
      claim: claim,
      blockchainVerified: blockchainSuccess
    });

  } catch (error) {
    console.error('Error in approve route:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

export default router;