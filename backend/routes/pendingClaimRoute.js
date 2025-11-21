  import express from 'express';
  import { ethers } from 'ethers';
  import mongoose from 'mongoose';
  import Claim from '../models/Claim.js'; // Import the Claim model
  import { default as pinataSDK } from '@pinata/sdk';
  import fs from 'fs'; // For file system operations
  import path from 'path'; // Path operations
  import dotenv from 'dotenv'; // To load environment variables
  import axios from 'axios';
  dotenv.config();

  const router = express.Router();

  // Pinata API setup
  const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY); // Use 'new' here
  // Ethereum configuration
  const provider = new ethers.JsonRpcProvider('HTTP://127.0.0.1:7545'); // Ganache RPC URL
  const privateKey = '0x266aea04456d3685fd9393aaf11fd7d7a7b31cfd5ce3efbb111e29fbdc9b3fba'; // Ganache account private key
  const wallet = new ethers.Wallet(privateKey, provider);

  // The deployed contract's address and ABI (you must define the ABI here)
  const contractAddress = '0x0AD00B57C3A5Eb1B1AB4d07A9BA7E2E904BF9946'; // Updated contract address
  const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        }
      ],
      "name": "ClaimApproved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        }
      ],
      "name": "ClaimPaid",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "ClaimRejected",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "claimant",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "doctorName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "patientName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "doctorId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "patientId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "diagnosis",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "treatment",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reportCID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ClaimSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        }
      ],
      "name": "ClaimVerified",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctor",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        }
      ],
      "name": "DoctorNotified",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        }
      ],
      "name": "approveClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "claimCountPerClaimant",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "claimantClaims",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "claims",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "claimant",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "doctorName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "patientName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "doctorId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "patientId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "diagnosis",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "treatment",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "reportCID",
              "type": "string"
            }
          ],
          "internalType": "struct InsuranceClaim.ClaimDetails",
          "name": "details",
          "type": "tuple"
        },
        {
          "internalType": "enum InsuranceClaim.ClaimStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "doctor",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        }
      ],
      "name": "getClaim",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "claimId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "claimant",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "doctorName",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "patientName",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "doctorId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "patientId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "diagnosis",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "treatment",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "reportCID",
                  "type": "string"
                }
              ],
              "internalType": "struct InsuranceClaim.ClaimDetails",
              "name": "details",
              "type": "tuple"
            },
            {
              "internalType": "enum InsuranceClaim.ClaimStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "doctor",
              "type": "address"
            }
          ],
          "internalType": "struct InsuranceClaim.Claim",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "claimant",
          "type": "address"
        }
      ],
      "name": "getClaimCountForClaimant",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "claimant",
          "type": "address"
        }
      ],
      "name": "getClaimantClaims",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        }
      ],
      "name": "payClaim",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "rejectClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "doctorName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "patientName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "doctorId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "patientId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "diagnosis",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "treatment",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "reportCID",
          "type": "string"
        }
      ],
      "name": "submitClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "reportCID",
          "type": "string"
        }
      ],
      "name": "validateReportCID",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        }
      ],
      "name": "verifyClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  // TODO:
  router.get('/pending', async (req, res) => {
    console.log("Inside pending claim");
    try {
      const stage = (req.query.stage || 'all').toLowerCase();
      let query = {};

      if (stage === 'doctor') {
        query = {
          $and: [
            { $or: [{ currentStage: { $exists: false } }, { currentStage: 'doctor' }] },
            { $or: [{ doctorApprovalStatus: { $exists: false } }, { doctorApprovalStatus: 'pending' }] }
          ]
        };
      } else if (stage === 'insurer') {
        query = {
          currentStage: 'insurer',
          doctorApprovalStatus: 'approved',
          insurerApprovalStatus: 'pending'
        };
      } else if (stage === 'completed') {
        query = { currentStage: 'completed' };
      } else {
        // Backwards compatibility: return the traditional pending/under-review set
        query = { status: { $in: ['under review', 'pending'] } };
      }

      const pendingClaims = await Claim.find(query);

      // Always return pendingClaims array, even if empty
      if (pendingClaims.length === 0) {
        return res.status(200).json({ pendingClaims: [] });
      }

      // Prepare the list of claims with relevant details
      const responseClaims = pendingClaims.map(dbClaim => ({
        claimId: dbClaim.claimId,  // Claim ID from the database
        claimant: dbClaim.patientName,  // Patient's name from the database
        amount: dbClaim.amount,  // Amount from the database
        description: dbClaim.description || 'No description',  // Description from the database (if available)
        doctorName: dbClaim.doctorName,  // Doctor's name from the database
        patientName: dbClaim.patientName,  // Patient's name from the database
        reportCID: dbClaim.reportCID,  // Report CID from the database (if available)
        status: dbClaim.status,  // Status from the database
        submissionDate: dbClaim.createdAt ? dbClaim.createdAt.toISOString() : 'N/A',  // Submission date
        transactionHash: dbClaim.transactionHash || 'N/A',  // Transaction hash if available
        doctorApprovalStatus: dbClaim.doctorApprovalStatus,
        insurerApprovalStatus: dbClaim.insurerApprovalStatus,
        currentStage: dbClaim.currentStage,
        doctorReviewedAt: dbClaim.doctorReviewedAt,
        insurerReviewedAt: dbClaim.insurerReviewedAt,
      }));

      // Respond with the list of pending claims
      return res.status(200).json({ pendingClaims: responseClaims });
    } catch (error) {
      console.error('Error fetching pending claims:', error);
      return res.status(500).json({ error: 'Failed to fetch pending claims.' });
    }
  });

    

 
 
 
  router.post('/validate/:claimId', async (req, res) => {
    console.log("Inside validations bhai");
    const { claimId } = req.params;
    console.log("Received request to validate claim with ID:", claimId);
  
    try {
      // Fetch claim from the database using claimId (try both claimId field and _id)
      console.log("Fetching claim from the database...");
      let claim = await Claim.findOne({ claimId: claimId });
      
      // If not found by claimId field, try finding by _id if it's a valid ObjectId
      if (!claim && mongoose.Types.ObjectId.isValid(claimId)) {
        claim = await Claim.findById(claimId);
      }
      
      if (!claim) {
        console.error("Claim not found for ID:", claimId);
        return res.status(404).json({ error: 'Claim not found in database.' });
      }
  
      console.log("Claim fetched:", claim);
  
      // Ensure the claim passed doctor review
      if (claim.doctorApprovalStatus !== 'approved') {
        console.warn("Claim has not been approved by a doctor. Claim ID:", claimId);
        return res.status(400).json({ error: 'Claim must be approved by a doctor before insurer verification.' });
      }

      // Ensure the claim is currently awaiting insurer action
      if (claim.currentStage !== 'insurer' || claim.insurerApprovalStatus !== 'pending') {
        return res.status(400).json({ error: 'Claim is not awaiting insurer verification.' });
      }

      // Check if the claim is already verified
      if (claim.isVerified) {
        console.warn("Claim is already verified. Claim ID:", claimId);
        return res.status(400).json({ error: 'Claim is already verified.' });
      }

      // Try blockchain verification, but don't fail if blockchain is not available
      let transactionHash = null;
      let blockchainVerified = false;

      try {
        // Check if the claimId exists on the blockchain
        console.log("Checking if claimId exists on the blockchain...");
        const blockchainClaim = await contract.claims(claimId); // Call the smart contract to fetch the claim by ID
        if (!blockchainClaim || !blockchainClaim.claimant) {
          console.warn("Claim ID does not exist on the blockchain:", claimId);
          // Continue with database-only verification if blockchain is not available
        } else {
          console.log("Claim exists on the blockchain:", blockchainClaim);
  
          // Interact with the smart contract to verify the claim
          console.log("Interacting with the smart contract to verify claim...");
          const tx = await contract.verifyClaim(claimId, {
            from: wallet.address, // Using the wallet associated with the private key
            gasLimit: 500000, // Set an appropriate gas limit for the transaction
          });
          console.log("Transaction initiated. Waiting for it to be mined...");
  
          await tx.wait(); // Wait for the transaction to be mined
          console.log("Transaction mined. Hash:", tx.hash);
          transactionHash = tx.hash;
          blockchainVerified = true;
        }
      } catch (blockchainError) {
        console.warn("Blockchain verification failed, proceeding with database-only verification:", blockchainError.message);
        // Continue with database-only verification
        // This allows the system to work even if blockchain is not available
      }
  
      // Update claim status in the database (regardless of blockchain status)
      claim.isVerified = true;
      claim.status = "approved"; // Change the claim status to 'approved'
      claim.insurerApprovalStatus = 'approved';
      claim.insurerReviewedAt = new Date();
      claim.currentStage = 'completed';
      if (transactionHash) {
        claim.transactionHash = transactionHash; // Save transaction hash if available
      }
      console.log("Updating claim status in the database...");
      await claim.save();
  
      // Respond with success
      console.log("Claim verified successfully. Returning response...");
      return res.status(200).json({
        message: blockchainVerified 
          ? 'Claim verified successfully on blockchain and database.' 
          : 'Claim verified successfully in database.',
        transactionHash: transactionHash || 'N/A',
        blockchainVerified: blockchainVerified
      });
    } catch (error) {
      console.error('Error verifying claim:', error);
  
      // Provide more specific error messages
      let errorMessage = 'Failed to verify claim.';
      if (error.message) {
        errorMessage += ` ${error.message}`;
      }
      if (error.reason) {
        errorMessage += ` Reason: ${error.reason}`;
      }
  
      // Check if the error is specific to contract interaction
      if (error.error && error.error.message) {
        console.error("Smart contract error message:", error.error.message);
        errorMessage += ` Blockchain error: ${error.error.message}`;
      }
  
      // General error response
      return res.status(500).json({ 
        error: errorMessage,
        details: error.message || 'Unknown error occurred'
      });
    }
  });
  
  
  
  // Route to upload report to Pinata (for report CID)
  
  

  
  router.post('/claims/upload-report', async (req, res) => {
    const { claimId, reportFile } = req.body;  // Get report file from frontend

    try {
      // Read the file and prepare for upload to Pinata
      const reportPath = path.join(__dirname, 'uploads', reportFile);
      const fileStream = fs.createReadStream(reportPath);

      // Pin the file to Pinata
      const pinataResponse = await pinata.pinFileToIPFS(fileStream);
      const reportCID = pinataResponse.IpfsHash;  // Get CID from the response

      // Update the claim with the report CID
      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      claim.reportCID = reportCID;  // Store the CID of the report in DB
      await claim.save();

      res.json({ message: 'Report uploaded successfully', reportCID });

    } catch (error) {
      console.error('Error uploading report to Pinata:', error);
      res.status(500).json({ message: 'Error uploading report to Pinata' });
    }
  });

  router.post('/reject/:claimId', async (req, res) => {
    const { claimId } = req.params;
    const { reason } = req.body;

    try {
      let claim = await Claim.findOne({ claimId });

      if (!claim && mongoose.Types.ObjectId.isValid(claimId)) {
        claim = await Claim.findById(claimId);
      }

      if (!claim) {
        return res.status(404).json({ error: 'Claim not found in database.' });
      }

      if (claim.doctorApprovalStatus !== 'approved') {
        return res.status(400).json({ error: 'Claim must be approved by a doctor before insurer review.' });
      }

      if (claim.currentStage !== 'insurer' || claim.insurerApprovalStatus !== 'pending') {
        return res.status(400).json({ error: 'Claim is not awaiting insurer review.' });
      }

      let transactionHash = null;
      let blockchainVerified = false;

      try {
        const tx = await contract.rejectClaim(claim.claimId || claimId, reason || 'Claim rejected by insurer', {
          gasLimit: 500000,
        });
        await tx.wait();
        transactionHash = tx.hash;
        blockchainVerified = true;
      } catch (blockchainError) {
        console.warn("Blockchain rejection failed, falling back to database-only update:", blockchainError.message);
      }

      claim.status = 'rejected';
      claim.rejectionReason = reason || 'Claim rejected by insurer';
      claim.insurerApprovalStatus = 'rejected';
      claim.insurerReviewedAt = new Date();
      claim.currentStage = 'completed';
      if (transactionHash) {
        claim.transactionHash = transactionHash;
      }

      await claim.save();

      return res.status(200).json({
        message: 'Claim rejected successfully.',
        claim,
        blockchainVerified,
        transactionHash: transactionHash || 'N/A',
      });
    } catch (error) {
      console.error('Error rejecting claim:', error);
      return res.status(500).json({
        error: 'Failed to reject claim.',
        details: error.message || 'Unknown error occurred'
      });
    }
  });



  // Assuming you have already imported necessary modules and set up your server

  
  // Route to get claim by claimId
  router.get('/claim/:claimId', async (req, res) => {
      try {
          // Get claimId from request parameters
          const { claimId } = req.params;

          // Find the claim in the database by claimId
          const claim = await Claim.findOne({ claimId });

          // If claim not found, send a 404 error
          if (!claim) {
              return res.status(404).json({ error: 'Claim not found' });
          }

          // Return the found claim as a response
          res.status(200).json(claim);
      } catch (error) {
          console.error('Error occurred while fetching the claim:', error);
          res.status(500).json({ error: 'Server error. Please try again later.' });
      }
  });




// TODO: 
  // router.post('/review/:claimId', async (req, res) => {
  //   const { claimId } = req.params;
  //   const { status, doctorReview } = req.body;
  
  //   // Log the incoming data to verify
  //   console.log("Received status:", status);  // Log status
  //   console.log("Received doctorReview:", doctorReview);  // Log doctorReview
  
  //   try {
  //     // Fetch the claim from the database, populating the documents
  //     const claim = await Claim.findOne({ claimId }).populate('documents');
  
  //     // Check if claim exists
  //     if (!claim) {
  //       return res.status(404).json({ error: 'Claim not found.' });
  //     }
  
  //     // Check if the claim has already been reviewed
  //     if (claim.status !== 'pending') {
  //       return res.status(400).json({ error: 'Claim has already been reviewed.' });
  //     }
  
  //     // Ensure a rejection reason is provided if the claim is rejected
  //     if (status === 'reject' && !doctorReview) {
  //       return res.status(400).json({ error: 'Please provide a rejection reason.' });
  //     }
  
  //     // Update the claim status and doctor review
  //     if (status === 'approve') {
  //       claim.status = 'approved';
  //       claim.doctorReview = doctorReview || '';
  //     } else if (status === 'reject') {
  //       claim.status = 'rejected';
  //       claim.doctorReview = doctorReview;
  //     } else {
  //       return res.status(400).json({ error: 'Invalid status. Use "approve" or "reject".' });
  //     }
  
  //     // Add IPFS URL and file data for each document
  //     const documentData = await Promise.all(
  //       claim.documents.map(async (doc) => {
  //         const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`;
  //         try {
  //           // Fetch the file data from IPFS
  //           const response = await axios.get(ipfsUrl, { responseType: 'arraybuffer' });
  //           return {
  //             ...doc.toObject(),
  //             fileData: response.data.toString('base64'), // Convert file data to base64
  //             fileUrl: ipfsUrl, // IPFS URL for the document
  //             ipfsHash: doc.ipfsHash // The IPFS hash
  //           };
  //         } catch (error) {
  //           console.error('Error fetching document from IPFS:', error);
  //           // Return the document with the URL and hash in case of error
  //           return {
  //             ...doc.toObject(),
  //             fileUrl: ipfsUrl,
  //             ipfsHash: doc.ipfsHash
  //           };
  //         }
  //       })
  //     );
  
  //     // Save the claim with updated status and review
  //     await claim.save();
  
  //     // Return the response with status, claim data, and documents
  //     res.status(200).json({
  //       message: `Claim ${status === 'approve' ? 'approved' : 'rejected'} successfully.`,
  //       claim,
  //       documents: documentData
  //     });
  //   } catch (error) {
  //     console.error('Error occurred while reviewing the claim:', error);
  //     res.status(500).json({ error: 'Error occurred while reviewing the claim.' });
  //   }
  // });
  
  
//   router.post('/review/:claimId', async (req, res) => {
//     const { claimId } = req.params;
//     const { status, doctorReview } = req.body;

//     // Log the incoming data to verify
//     console.log("Received status:", status);  // Log status
//     console.log("Received doctorReview:", doctorReview);  // Log doctorReview

//     try {
//         // Fetch the claim from the database, populating the documents
//         const claim = await Claim.findOne({ claimId }).populate('documents');

//         // Check if claim exists
//         if (!claim) {
//             return res.status(404).json({ error: 'Claim not found.' });
//         }

//         // Check if the claim has already been reviewed
//         if (claim.status !== 'pending') {
//             return res.status(400).json({ error: 'Claim has already been reviewed.' });
//         }

//         // Fraud detection logic: call the fraud detection model API
//         const claimDataForFraudDetection = {
//             claimAmount: claim.claimAmount,
//             diagnosis: claim.diagnosis,
//             treatment: claim.treatment,
//             // Add other necessary data points for fraud detection here
//         };

//         // Call the fraud detection API
//         const fraudResponse = await axios.post('http://127.0.0.1:5001/predict', claimDataForFraudDetection);
        
//         // Check the response for fraud detection
//         const fraudDetected = fraudResponse.data.fraud; // Assuming the response contains a 'fraud' key

//         if (fraudDetected) {
//             // Automatically reject the claim if fraud is detected
//             claim.status = 'rejected';
//             claim.doctorReview = 'Claim is fraudulent and rejected automatically.';
//             await claim.save();
//             return res.status(200).json({
//                 message: 'Claim rejected due to fraud detection.',
//                 claim,
//             });
//         }

//         // If the claim is not fraudulent, proceed with normal review
//         if (status === 'approve') {
//             claim.status = 'approved';
//             claim.doctorReview = doctorReview || '';
//         } else if (status === 'reject') {
//             claim.status = 'rejected';
//             claim.doctorReview = doctorReview;
//         } else {
//             return res.status(400).json({ error: 'Invalid status. Use "approve" or "reject".' });
//         }

//         // Add IPFS URL and file data for each document
//         const documentData = await Promise.all(
//             claim.documents.map(async (doc) => {
//                 const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`;
//                 try {
//                     // Fetch the file data from IPFS
//                     const response = await axios.get(ipfsUrl, { responseType: 'arraybuffer' });
//                     return {
//                         ...doc.toObject(),
//                         fileData: response.data.toString('base64'), // Convert file data to base64
//                         fileUrl: ipfsUrl, // IPFS URL for the document
//                         ipfsHash: doc.ipfsHash // The IPFS hash
//                     };
//                 } catch (error) {
//                     console.error('Error fetching document from IPFS:', error);
//                     // Return the document with the URL and hash in case of error
//                     return {
//                         ...doc.toObject(),
//                         fileUrl: ipfsUrl,
//                         ipfsHash: doc.ipfsHash
//                     };
//                 }
//             })
//         );

//         // Save the claim with updated status and review
//         await claim.save();

//         // Return the response with status, claim data, and documents
//         res.status(200).json({
//             message: `Claim ${status === 'approve' ? 'approved' : 'rejected'} successfully.`,
//             claim,
//             documents: documentData
//         });
//     } catch (error) {
//         console.error('Error occurred while reviewing the claim:', error);
//         res.status(500).json({ error: 'Error occurred while reviewing the claim.' });
//     }
// });

router.post('/review/:claimId', async (req, res) => {
  const { claimId } = req.params;
  const { status, doctorReview } = req.body;

  // Log the incoming data to verify
  console.log("Received status:", status);  // Log status
  console.log("Received doctorReview:", doctorReview);  // Log doctorReview

  try {
      // Fetch the claim from the database, populating the documents
      const claim = await Claim.findOne({ claimId }).populate('documents');

      // Check if claim exists
      if (!claim) {
          return res.status(404).json({ error: 'Claim not found.' });
      }

      // Ensure the claim is awaiting doctor review
      if (claim.currentStage !== 'doctor' || claim.doctorApprovalStatus !== 'pending') {
          return res.status(400).json({ error: 'Claim is not awaiting doctor review.' });
      }

      // Fraud detection logic: call the fraud detection model API (optional)
      let fraudDetected = false;
      let rejectionReason = '';

      try {
          const claimDataForFraudDetection = {
              claimAmount: claim.amount,
              diagnosis: claim.description,
              treatment: claim.description,
              // Add other necessary data points for fraud detection here
          };

          // Call the fraud detection API (if available)
          // This is optional - if the API is not available, we'll proceed with manual review
          const fraudResponse = await axios.post('http://127.0.0.1:5001/predict', claimDataForFraudDetection, {
              timeout: 5000 // 5 second timeout
          });
          
          // Check the response for fraud detection
          if (fraudResponse.data && fraudResponse.data.fraud) {
              fraudDetected = fraudResponse.data.fraud;
          }
      } catch (error) {
          // If fraud detection API is not available, log the error and proceed with manual review
          console.log('Fraud detection API not available, proceeding with manual review:', error.message);
          fraudDetected = false;
      }

      if (fraudDetected) {
          // Automatically reject the claim if fraud is detected
          claim.status = 'rejected';
          claim.doctorReview = 'Claim is fraudulent and rejected automatically based on fraud detection analysis.';
          claim.rejectionReason = claim.doctorReview;
          rejectionReason = claim.doctorReview;
          claim.doctorApprovalStatus = 'rejected';
          claim.doctorReviewedAt = new Date();
          claim.currentStage = 'completed';
          claim.insurerApprovalStatus = 'skipped';
          claim.insurerReviewedAt = undefined;
          await claim.save();
          return res.status(200).json({
              message: 'Claim rejected due to fraud detection.',
              claim,
              rejectionReason: claim.doctorReview
          });
      }

      // If the claim is not fraudulent, proceed with normal review
      if (status === 'approve') {
          claim.status = 'under review';
          claim.doctorReview = doctorReview || '';
          claim.doctorApprovalStatus = 'approved';
          claim.doctorReviewedAt = new Date();
          claim.currentStage = 'insurer';
          claim.insurerApprovalStatus = 'pending';
          claim.insurerReviewedAt = undefined;
          rejectionReason = '';
      } else if (status === 'reject') {
          claim.status = 'rejected';
          claim.doctorReview = doctorReview || 'Claim has been rejected by the doctor.';
          claim.rejectionReason = claim.doctorReview;
          claim.doctorApprovalStatus = 'rejected';
          claim.doctorReviewedAt = new Date();
          claim.currentStage = 'completed';
          claim.insurerApprovalStatus = 'skipped';
          claim.insurerReviewedAt = undefined;
          rejectionReason = claim.doctorReview;
      } else {
          return res.status(400).json({ error: 'Invalid status. Use "approve" or "reject".' });
      }

      // Add IPFS URL and file data for each document
      const documentData = await Promise.all(
          claim.documents.map(async (doc) => {
              const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`;
              try {
                  // Fetch the file data from IPFS
                  const response = await axios.get(ipfsUrl, { responseType: 'arraybuffer' });
                  return {
                      ...doc.toObject(),
                      fileData: response.data.toString('base64'), // Convert file data to base64
                      fileUrl: ipfsUrl, // IPFS URL for the document
                      ipfsHash: doc.ipfsHash // The IPFS hash
                  };
              } catch (error) {
                  console.error('Error fetching document from IPFS:', error);
                  // Return the document with the URL and hash in case of error
                  return {
                      ...doc.toObject(),
                      fileUrl: ipfsUrl,
                      ipfsHash: doc.ipfsHash
                  };
              }
          })
      );

      // Save the claim with updated status and review
      await claim.save();

      // Return the response with status, claim data, and documents
      res.status(200).json({
          message: `Claim ${status === 'approve' ? 'approved' : 'rejected'} successfully.`,
          claim,
          documents: documentData,
          rejectionReason: rejectionReason || 'No rejection reason provided.'
      });
  } catch (error) {
      console.error('Error occurred while reviewing the claim:', error);
      res.status(500).json({ error: 'Error occurred while reviewing the claim.' });
  }
});

  
  // router.post('/approve', async (req, res) => {
  //   console.log("Inside approved claim");
  //   console.log("Inside Approving claim... route");
  //   console.log("Incoming request body:", req.body);
  
  //   const { claimId, doctorId, approvalStatus } = req.body;
  //   if (!claimId || !doctorId || !approvalStatus) {
  //     return res.status(400).json({ message: 'Missing required fields' });
  //   }
  
  //   try {
  //     // Step 1: Validate the claimId and doctorId
  //     const claimObjectId = validateObjectId(claimId, res, 'claimId');
  //     const doctorObjectId = validateObjectId(doctorId, res, 'doctorId');
  
  //     // Step 2: Find the claim
  //     const claim = await Claim.findById(claimObjectId);
  //     if (!claim) {
  //       return res.status(404).json({ message: 'Claim not found' });
  //     }
  
  //     // Step 3: Validate the doctor’s authorization
  //     if (!claim.doctorId.equals(doctorObjectId)) {
  //       return res.status(403).json({ message: 'Unauthorized to approve this claim' });
  //     }
  
  //     // Step 4: Check if the claim is pending
  //     if (claim.status !== 'pending') {
  //       return res.status(400).json({ message: 'Claim is not pending, cannot approve' });
  //     }
  
  //     // Step 5: Interact with the blockchain (Approval on blockchain)
  //     const approvalResult = await approveClaimOnBlockchain(claimId, approvalStatus);
  
  //     if (approvalResult.success) {
  //       // Step 6: Update the claim status to 'verified' if the approval was successful
  //       claim.status = 'verified'; // Change state to verified
  //       claim.auditTrail.push({
  //         action: `Claim ${approvalStatus} and verified`,
  //         timestamp: new Date().toLocaleString(),
  //       });
  
  //       await claim.save();
  
  //       return res.status(200).json({ message: 'Claim successfully approved and verified', claim });
  //     } else {
  //       return res.status(400).json({ message: 'Error approving the claim on blockchain' });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // });
  
  

  // router.get('/approved', async (req, res) => {
  //   console.log("Fetching approved claims...");
  
  //   try {
  //     // Step 1: Fetch claims with status 'verified'
  //     const approvedClaims = await Claim.find({ status: 'verified' });
  
  //     if (approvedClaims.length === 0) {
  //       return res.status(404).json({ message: 'No approved claims found' });
  //     }
  
  //     // Step 2: Return the approved claims
  //     return res.status(200).json({ approvedClaims });
  //   } catch (error) {
  //     console.error('Error fetching approved claims:', error);
  //     return res.status(500).json({ message: 'Internal server error' });
  //   }
  // });
   
  
  
  // Route to get doctor-approved claims with insurer decisions
  // This shows claims that the doctor has approved and displays the insurer's final decision
  router.get('/doctor-approved', async (req, res) => {
    console.log("Fetching doctor-approved claims with insurer decisions");
    try {
      const query = {
        doctorApprovalStatus: 'approved',
        currentStage: 'completed'
      };

      const approvedClaims = await Claim.find(query);

      if (approvedClaims.length === 0) {
        return res.status(200).json({ approvedClaims: [] });
      }

      // Prepare the list of claims with relevant details
      const responseClaims = approvedClaims.map(dbClaim => ({
        claimId: dbClaim.claimId,
        claimant: dbClaim.patientName,
        amount: dbClaim.amount,
        description: dbClaim.description || 'No description',
        doctorName: dbClaim.doctorName,
        patientName: dbClaim.patientName,
        reportCID: dbClaim.reportCID,
        status: dbClaim.status,
        submissionDate: dbClaim.createdAt ? dbClaim.createdAt.toISOString() : 'N/A',
        transactionHash: dbClaim.transactionHash || 'N/A',
        doctorApprovalStatus: dbClaim.doctorApprovalStatus,
        insurerApprovalStatus: dbClaim.insurerApprovalStatus,
        currentStage: dbClaim.currentStage,
        doctorReviewedAt: dbClaim.doctorReviewedAt ? dbClaim.doctorReviewedAt.toISOString() : 'N/A',
        insurerReviewedAt: dbClaim.insurerReviewedAt ? dbClaim.insurerReviewedAt.toISOString() : 'N/A',
        rejectionReason: dbClaim.rejectionReason || '',
        doctorReview: dbClaim.doctorReview || '',
      }));

      return res.status(200).json({ approvedClaims: responseClaims });
    } catch (error) {
      console.error('Error fetching doctor-approved claims:', error);
      return res.status(500).json({ error: 'Failed to fetch doctor-approved claims.' });
    }
  });

  export default router;


