const { ethers } = require('ethers');

// Connect to Ganache
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

async function checkBalances() {
  try {
    // Get all accounts
    const accounts = await provider.listAccounts();
    
    console.log('Account Balances:');
    console.log('==================');
    
    // Check balance of each account
    for (let i = 0; i < Math.min(accounts.length, 5); i++) {
      const balance = await provider.getBalance(accounts[i]);
      const balanceInEth = ethers.formatEther(balance);
      console.log(`Account ${i}: ${accounts[i]}`);
      console.log(`Balance: ${balanceInEth} ETH`);
      console.log('---');
    }
  } catch (error) {
    console.error('Error checking balances:', error);
  }
}

// Run the function
checkBalances();