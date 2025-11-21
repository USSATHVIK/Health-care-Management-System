// controllers/claimTrackerController.js
import Claim from '../models/Claim.js';
import mongoose from 'mongoose';

// Controller to fetch claim status based on claim ID
export const getClaimStatus = async (req, res) => {
    try {
        const { claimId } = req.params; // Get claimId from URL params

        console.log('Fetching claim with ID:', claimId);

        if (!claimId) {
            console.warn('Claim ID is missing');
            return res.status(400).json({ message: 'Claim ID is required' });
        }

        // Search for claim by claimId (string field) - NOT by _id
        // This avoids the ObjectId casting error
        const claim = await Claim.findOne({ claimId: claimId });

        if (!claim) {
            console.warn('Claim not found for claimId:', claimId);
            return res.status(404).json({ message: 'Claim not found' });
        }

        console.log('Claim found:', claim.claimId);

        // Return comprehensive claim details
        res.status(200).json({
            claimId: claim.claimId,
            patientName: claim.patientName,
            doctorName: claim.doctorName,
            amount: claim.amount,
            status: claim.status,
            currentStage: claim.currentStage,
            submissionDate: claim.createdAt,
            doctorApprovalStatus: claim.doctorApprovalStatus,
            insurerApprovalStatus: claim.insurerApprovalStatus,
            rejectionReason: claim.rejectionReason,
            doctorReview: claim.doctorReview,
            description: claim.description,
            transactionHash: claim.transactionHash,
            doctorReviewedAt: claim.doctorReviewedAt,
            insurerReviewedAt: claim.insurerReviewedAt
        });
    } catch (error) {
        console.error('Error fetching claim status:', error);
        res.status(500).json({ 
            message: 'Error fetching claim status',
            error: error.message 
        });
    }
};
