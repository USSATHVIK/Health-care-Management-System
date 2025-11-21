# Blockchain Deployment Guide

This guide walks you through deploying the InsuranceClaim smart contract and running the blockchain locally.

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Ganache CLI** or **Ganache GUI** (for local blockchain)

## Step 1: Install Ganache

### Option A: Install Ganache CLI (Recommended for automation)
```bash
npm install -g ganache-cli
```

### Option B: Download Ganache GUI
Download from: https://www.trufflesuite.com/ganache

## Step 2: Start the Blockchain

### Using Ganache CLI:
```bash
ganache-cli --host 127.0.0.1 --port 7545 --deterministic
```

The `--deterministic` flag ensures you get the same accounts and private keys each time (useful for testing).

**Expected Output:**
```
Ganache CLI v6.x.x (ganache-core: 2.x.x)

Available Accounts
==================
(0) 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
(1) 0xf17f52151EbEF6C7334FAD080c5704DAAA16b732
...

Private Keys
==================
(0) 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
(1) 0xf17f52151EbEF6C7334FAD080c5704DAAA16b732
...

Listening on 127.0.0.1:7545
```

### Using Ganache GUI:
1. Open Ganache
2. Click "New Workspace"
3. Set RPC Server to `127.0.0.1:7545`
4. Click "Save Workspace"

## Step 3: Install Smart Contract Dependencies

Navigate to the smartcontracts directory and install dependencies:

```bash
cd smartcontracts
npm install
```

## Step 4: Deploy the Smart Contract

Run the deployment script:

```bash
npx hardhat run scripts/deploy.js --network ganache
```

**Expected Output:**
```
Checking account 0x627306090abaB3A6e1400e9345bC60c78a8BEf57: 100 ETH
✅ Using account with funds: 0x627306090abaB3A6e1400e9345bC60c78a8BEf57

Deploying contracts with the account: 0x627306090abaB3A6e1400e9345bC60c78a8BEf57

Deploying InsuranceClaim contract...

✅ InsuranceClaim contract deployed to: 0x1234567890123456789012345678901234567890

📋 Please update the contract address in backend/routes/claimSubmissionRoutes.js
   Line 144: const contractAddress = '0x1234567890123456789012345678901234567890';
```

## Step 5: Update Backend Configuration

Copy the deployed contract address and update your backend:

1. Open `backend/routes/claimSubmissionRoutes.js`
2. Find the line with `const contractAddress = ...`
3. Replace it with the address from Step 4

Example:
```javascript
const contractAddress = '0x1234567890123456789012345678901234567890';
```

## Step 6: Verify Deployment

You can verify the contract was deployed by checking the transaction on Ganache:

1. Open Ganache GUI or check CLI output
2. Look for the deployment transaction
3. Verify the contract address matches what you updated in the backend

## Troubleshooting

### Error: "No signers found"
- **Cause**: Ganache is not running or not accessible at `http://127.0.0.1:7545`
- **Solution**: Start Ganache CLI or Ganache GUI first

### Error: "First Ganache account has no funds"
- **Cause**: Ganache accounts don't have ETH
- **Solution**: Restart Ganache with `ganache-cli --deterministic` to reset accounts

### Error: "Connection refused"
- **Cause**: Hardhat cannot connect to Ganache
- **Solution**: Check that Ganache is running on port 7545

### Contract deployment fails
- **Cause**: Solidity version mismatch
- **Solution**: Ensure `hardhat.config.js` has `solidity: "0.8.0"` matching the contract

## Testing the Contract

After deployment, you can test the contract by running:

```bash
npx hardhat test
```

This will run all tests in the `test/` directory.

## Next Steps

1. Start your backend server
2. Start your frontend application
3. Test the insurance claim submission flow

The smart contract is now ready to handle insurance claims on the blockchain!

## Network Configuration

**Ganache Network Details:**
- **RPC URL**: http://127.0.0.1:7545
- **Chain ID**: 1337 (default for Ganache)
- **Currency**: ETH
- **Block Time**: ~0 seconds (instant mining)

## Contract Functions

The `InsuranceClaim` contract provides:

- `submitClaim()` - Submit a new insurance claim
- `verifyClaim()` - Doctor verifies the claim
- `approveClaim()` - Admin approves the claim
- `rejectClaim()` - Admin rejects the claim
- `payClaim()` - Admin pays the claim
- `getClaim()` - Retrieve claim details
- `detectFraud()` - Fraud detection mechanism
- `withdrawFunds()` - Admin withdraws funds

## Security Notes

⚠️ **Important**: This setup is for local development only. For production:
- Use a testnet (Sepolia, Goerli) or mainnet
- Implement proper security audits
- Use environment variables for sensitive data
- Never hardcode private keys
