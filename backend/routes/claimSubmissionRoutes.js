import express from 'express';
import { ethers } from 'ethers';
import pinataSDK from '@pinata/sdk';
import { keccak256, toUtf8Bytes } from 'ethers';
import Claim from '../models/Claim.js';
import axios from 'axios';
const router = express.Router();

// Initialize Pinata client with environment variables
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

// Ethereum configuration
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545'); // Use lowercase http://

// Get the first account from Ganache (which has funds by default)
// If you need to use a specific private key, uncomment the line below and comment out the getSigner() approach
// const privateKey = '0xde1d348cea3d91022e95db5af9ae07a06b287d3331d12c28c0a93292fefe992f';
// const wallet = new ethers.Wallet(privateKey, provider);

// Use the first account from Ganache (has 100 ETH by default)
// This function will be called to get a wallet with funds
async function getWallet() {
  try {
    // In ethers v6, listAccounts() returns an array of signers or addresses
    const accounts = await provider.listAccounts();
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in Ganache. Please ensure Ganache is running.');
    }
    
    // Get the first account - might be a signer object or address string
    let firstAccountAddress;
    let firstAccountSigner = null;
    
    if (typeof accounts[0] === 'string') {
      firstAccountAddress = accounts[0];
    } else {
      // It's a signer object
      firstAccountSigner = accounts[0];
      try {
        firstAccountAddress = await firstAccountSigner.getAddress();
      } catch (e) {
        firstAccountAddress = firstAccountSigner.address || 'Unknown';
      }
    }
    
    console.log('First Ganache account:', firstAccountAddress);
    
    // Check balance of first account
    const balance = await provider.getBalance(firstAccountAddress);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance === 0n) {
      throw new Error('First account has no funds. Please ensure Ganache is running and accounts are funded.');
    }
    
    // If we already have a signer, use it directly
    if (firstAccountSigner && typeof firstAccountSigner.sendTransaction === 'function') {
      console.log('Using signer directly from Ganache');
      return firstAccountSigner;
    }
    
    // Try common Ganache/Hardhat private keys for the first account
    // These are the default keys that Ganache often uses
    const possibleKeys = [
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Hardhat default first account
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Hardhat second account  
      '0x3c08ee639006a5c4ca91718e5fbfa4bf3af382969bbc31bb6f5bafdf7b3bf00a', // From hardhat config
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // Another common one
    ];
    
    // Try each key until we find one that matches the first account
    for (const privateKey of possibleKeys) {
      try {
        const wallet = new ethers.Wallet(privateKey, provider);
        
        // Check if this wallet's address matches the first account
        if (wallet.address.toLowerCase() === firstAccountAddress.toLowerCase()) {
          const walletBalance = await provider.getBalance(wallet.address);
          console.log('✓ Found matching private key for first account');
          console.log('Using wallet:', wallet.address);
          console.log('Wallet balance:', ethers.formatEther(walletBalance), 'ETH');
          return wallet;
        }
      } catch (e) {
        continue;
      }
    }
    
    // If no key matched, try to use the signer directly from listAccounts
    console.warn('Could not find private key matching first account. Trying to use signer directly...');
    try {
      const signer = accounts[0];
      if (signer && typeof signer.sendTransaction === 'function') {
        // It's a signer object, use it directly
        // Get address to verify
        let signerAddr;
        try {
          signerAddr = await signer.getAddress();
        } catch (e) {
          signerAddr = signer.address || firstAccountAddress;
        }
        console.log('Using signer directly from Ganache:', signerAddr);
        return signer;
      }
    } catch (signerError) {
      console.warn('Error using signer directly:', signerError.message);
    }
    
    // Try to find any account with funds using private keys
    for (const privateKey of possibleKeys) {
      try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const walletBalance = await provider.getBalance(wallet.address);
        
        if (walletBalance > 0n) {
          console.log('Using wallet with funds:', wallet.address);
          console.log('Wallet balance:', ethers.formatEther(walletBalance), 'ETH');
          return wallet;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Last resort: throw error with instructions
    throw new Error(
      `Could not find a wallet with funds. ` +
      `First account address: ${firstAccountAddress}. ` +
      `Please check Ganache UI for the first account's private key and update the possibleKeys array in getWallet() function.`
    );
    
  } catch (error) {
    console.error('Error getting wallet from Ganache:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to get wallet from Ganache: ${error.message}. Please ensure Ganache is running on http://localhost:7545`);
  }
}

// The deployed contract's new address
const contractAddress = '0xCfEB869F69431e42cdB54A4F4f105C19C080A601'; 
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
    "name": "FraudDetected",
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
      },
      {
        "internalType": "bool",
        "name": "isFraud",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
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
    "name": "detectDuplicateReportCID",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
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
    "name": "detectFraud",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
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
          },
          {
            "internalType": "bool",
            "name": "isFraud",
            "type": "bool"
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
    "inputs": [],
    "name": "insurer",
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
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "setAdmin",
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
// Contract will be created in the route handler with the wallet from getWallet()

// POST route to submit a claim
router.post('/submit', async (req, res) => {
  try {
    const {
      doctorName,
      patientName,
      doctorId,
      patientId,
      diagnosis,
      treatment,
      claimAmount,
      reportCID,
      walletAddress,
      description,
      reportMime,
      reportName,
    } = req.body;

    console.log('Received request to submit claim:', req.body);

    // Validation
    if (!patientName || !patientId || !doctorId || !diagnosis || !treatment || !claimAmount || !reportCID || !description) {
      console.error('Validation error: Missing required fields');
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (isNaN(claimAmount) || claimAmount <= 0) {
      console.error('Validation error: Invalid claim amount');
      return res.status(400).json({ error: 'Invalid claim amount.' });
    }

    // Allow any file type as long as a valid CID-like hash is provided (basic sanity check)
    if (typeof reportCID !== 'string' || reportCID.length < 10) {
      console.error('Validation error: Invalid report CID');
      return res.status(400).json({ error: 'Invalid report CID.' });
    }

    // Validate walletAddress if provided (optional - we'll use backend wallet anyway)
    if (walletAddress) {
      try {
        const validatedAddress = ethers.getAddress(walletAddress);
        console.log('Valid frontend wallet address:', validatedAddress);
      } catch (error) {
        console.warn('Invalid frontend wallet address, will use backend wallet:', error.message);
        // Don't fail - we'll use the backend wallet instead
      }
    }

    // Generate a unique claim ID
    const claimId = keccak256(toUtf8Bytes(`${Date.now()}-${patientId}`));
    console.log('Generated unique claim ID:', claimId);

    // Convert claimAmount to BigNumber using ethers.parseUnits (fix for error)
    const claimAmountInWei = ethers.parseUnits(claimAmount.toString(), 18);  // Assuming 18 decimals for ETH
    console.log('Claim amount in wei:', claimAmountInWei.toString());

    // Check if blockchain provider is available before attempting submission
    let wallet;
    let contract;
    let signerAddress;
    try {
      const blockNumber = await provider.getBlockNumber();
      console.log('Blockchain provider is connected. Current block:', blockNumber);
      
      // Get wallet with funds (first Ganache account)
      wallet = await getWallet();
      signerAddress = await wallet.getAddress();
      
      // Ensure signerAddress is a string
      if (typeof signerAddress !== 'string') {
        signerAddress = String(signerAddress);
      }
      
      // Check wallet balance
      const balance = await provider.getBalance(signerAddress);
      console.log('Wallet address:', signerAddress);
      console.log('Wallet balance:', ethers.formatEther(balance), 'ETH');
      
      if (balance === 0n) {
        return res.status(503).json({ 
          error: 'Insufficient funds in wallet. Please ensure the wallet has ETH to pay for gas fees.',
          walletAddress: signerAddress
        });
      }
      
      // Create contract instance with the wallet (signer)
      contract = new ethers.Contract(contractAddress, contractABI, wallet);
    } catch (providerError) {
      console.error('Blockchain provider error:', providerError);
      console.error('Error details:', providerError.message);
      return res.status(503).json({ 
        error: 'Blockchain service is currently unavailable. Please ensure Ganache is running on http://localhost:7545 and try again.',
        details: providerError.message || 'Unknown error'
      });
    }

    // Submit the claim to the smart contract (REQUIRED - claim will not be saved if this fails)
    let transactionHash = null;
    
    try {
      // Verify contract is deployed at the address
      const code = await provider.getCode(contractAddress);
      if (code === '0x' || code === '0x0') {
        console.error('Contract not found at address:', contractAddress);
        console.error('Please deploy the contract using: cd smartcontracts && npx hardhat run scripts/deploy.js --network ganache');
        return res.status(500).json({ 
          error: 'Smart contract not found at the specified address. Please deploy the contract to Ganache first.',
          contractAddress: contractAddress,
          instructions: 'To deploy: cd smartcontracts && npx hardhat run scripts/deploy.js --network ganache'
        });
      }
      console.log('Contract verified at address:', contractAddress);

      const tx = await contract.submitClaim(
        claimId,            // Backend-generated claimId
        claimAmountInWei,   // Claim amount (in wei)
        description,        // Description of the claim
        doctorName,         // Doctor's name
        patientName,        // Patient's name
        doctorId,           // Doctor's ID
        patientId,          // Patient's ID
        diagnosis,          // Diagnosis
        treatment,          // Treatment
        reportCID           // Report CID
      );

      console.log(`Transaction hash: ${tx.hash}`);
      const receipt = await provider.waitForTransaction(tx.hash, 1, 60000); // Wait up to 60 seconds

      if (receipt.status !== 1) {
        console.error('Transaction failed on the blockchain');
        return res.status(500).json({ 
          error: 'Blockchain transaction failed. The claim was not saved. Please try again.',
          transactionHash: tx.hash
        });
      }

      console.log(`Transaction mined successfully in block ${receipt.blockNumber}`);
      transactionHash = tx.hash;

    } catch (blockchainError) {
      console.error('Error while submitting claim to blockchain:', blockchainError);
      
      // Check for specific error messages from the smart contract
      if (blockchainError.message && blockchainError.message.includes("This medical report has already been used for another claim")) {
        return res.status(400).json({ 
          error: 'This medical report has already been used for another claim. Please upload a different report or contact support if you believe this is an error.' 
        });
      }
      
      // Check for connection errors
      if (blockchainError.message && (
        blockchainError.message.includes('ECONNREFUSED') || 
        blockchainError.message.includes('network') ||
        blockchainError.message.includes('connection') ||
        blockchainError.message.includes('fetch failed')
      )) {
        return res.status(503).json({ 
          error: 'Unable to connect to blockchain. Please ensure Ganache is running on http://localhost:7545 and try again.',
          details: blockchainError.message
        });
      }
      
      // Check for insufficient gas/funds
      if (blockchainError.message && (
        blockchainError.message.includes('insufficient funds') ||
        blockchainError.message.includes('gas') ||
        blockchainError.message.includes('balance')
      )) {
        let walletAddress = 'Unknown';
        try {
          if (wallet) {
            walletAddress = await wallet.getAddress();
          }
        } catch (e) {
          walletAddress = signerAddress || 'Unknown';
        }
        return res.status(503).json({ 
          error: 'Insufficient funds for transaction. Please ensure the wallet has enough ETH to pay for gas fees.',
          walletAddress: walletAddress,
          details: blockchainError.message
        });
      }
      
      // Handle revert errors
      if (blockchainError.message && blockchainError.message.includes("revert")) {
        return res.status(400).json({ 
          error: 'There was an issue processing your claim on the blockchain. Please check your information and try again.',
          details: blockchainError.message
        });
      }
      
      // Generic blockchain error
      return res.status(500).json({ 
        error: 'Unable to submit claim to blockchain. Please ensure Ganache is running and try again later.',
        details: blockchainError.message || 'Unknown blockchain error'
      });
    }

    // Save claim to the database ONLY after successful blockchain submission
    const autoSummary = [
      `Claim by ${patientName} for ${doctorName}`.trim(),
      diagnosis ? `Diagnosis: ${diagnosis}` : null,
      treatment ? `Treatment: ${treatment}` : null,
      description ? `Summary: ${description.slice(0, 200)}${description.length > 200 ? '...' : ''}` : null,
      `Amount: ₹${typeof claimAmount === 'number' ? claimAmount.toLocaleString('en-IN') : claimAmount}`,
      `Report: https://ipfs.io/ipfs/${reportCID}${reportName ? ` (${reportName})` : ''}`,
      'Blockchain: Verified'
    ].filter(Boolean).join(' | ');

    try {
      const newClaim = new Claim({
        claimId,            // Backend-generated claimId
        doctorName,
        patientName,
        doctorId,
        patientId,
        diagnosis,
        treatment,
        amount: parseFloat(claimAmount),  // Save the original amount entered by user
        reportCID,
        walletAddress: signerAddress, // Use the backend wallet address, not the frontend one
        status: 'pending',
        doctorApprovalStatus: 'pending',
        insurerApprovalStatus: 'waiting',
        currentStage: 'doctor',
        notes: autoSummary,
        transactionHash: transactionHash, // Set transaction hash from blockchain
        documents: [{
          fileUrl: `https://ipfs.io/ipfs/${reportCID}`,
          ipfsHash: reportCID,
          fileType: (reportMime || 'application/octet-stream'),
          description: reportName || 'Supporting report'
        }],
      });

      const savedClaim = await newClaim.save();
      console.log('Claim saved to the database successfully:', savedClaim);

      // Return success response
      res.status(201).json({
        message: 'Claim submitted successfully and stored on the blockchain!',
        claimId,
        transactionHash: transactionHash,
        blockchainVerified: true,
        claim: savedClaim
      });
    } catch (dbError) {
      console.error('Error saving claim to database after blockchain submission:', dbError);
      // Note: The claim was already submitted to blockchain, but failed to save to database
      // This is a critical error - the blockchain has the claim but database doesn't
      return res.status(500).json({ 
        error: 'Claim was submitted to blockchain but failed to save to database. Please contact support with your transaction hash.',
        transactionHash: transactionHash,
        details: dbError.message
      });
    }

  } catch (error) {
    console.error('Error occurred while submitting the claim:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Add this status endpoint
router.get('/status/:claimId', async (req, res) => {
  try {
    const { claimId } = req.params;
    
    // Find the claim in the database
    const claim = await Claim.findOne({ claimId });
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    // Return the claim status
    res.status(200).json({ 
      claimId: claim.claimId,
      status: claim.status,
      doctorName: claim.doctorName,
      patientName: claim.patientName,
      diagnosis: claim.diagnosis,
      treatment: claim.treatment,
      amount: claim.amount,
      timestamp: claim.createdAt
    });
  } catch (error) {
    console.error('Error fetching claim status:', error);
    res.status(500).json({ error: 'Error occurred while fetching claim status' });
  }
});

export default router;