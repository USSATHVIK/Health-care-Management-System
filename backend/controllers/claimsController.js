// controllers/claimsController.js
import Claim from '../models/Claim.js';  // Assuming you have a Claim model
import Analytics from '../models/Analytics.js';  // Assuming you have an Analytics model
import mongoose from 'mongoose';

// Get all rejected claims
export const getRejectedClaims = async (req, res) => {
  try {
    const rejectedClaims = await Claim.find({ status: 'rejected' }).sort({ updatedAt: -1 });
    res.json(rejectedClaims);
  } catch (error) {
    console.error('Error fetching rejected claims:', error);
    res.status(500).json({ 
      message: 'Error fetching rejected claims', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};

// Dispute a claim
export const disputeClaim = async (req, res) => {
  const { claimId } = req.params;
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Dispute message is required' });
  }

  try {
    // Try to find by claimId field first (string UUID)
    let claim = await Claim.findOne({ claimId: claimId });
    
    // If not found, try to find by _id if claimId is a valid ObjectId
    if (!claim && mongoose.Types.ObjectId.isValid(claimId)) {
      claim = await Claim.findById(claimId);
    }

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if claim is actually rejected
    if (claim.status !== 'rejected') {
      return res.status(400).json({ message: `Claim is not rejected. Current status: ${claim.status}` });
    }

    // Update claim with dispute message
    claim.disputeMessage = message.trim();
    claim.status = 'under review'; // Change status to "under review"
    await claim.save();

    res.json({ 
      status: 'Dispute submitted successfully',
      claim: claim
    });
  } catch (error) {
    console.error('Error submitting dispute:', error);
    res.status(500).json({ message: 'Error submitting dispute', error: error.message });
  }
};

// Get rejection analytics
export const getAnalytics = async (req, res) => {
  try {
    // Fetch rejection analytics from your model or logic
    const analytics = await Analytics.findOne();  // Assuming analytics are stored in a document
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rejection analytics', error });
  }
};
