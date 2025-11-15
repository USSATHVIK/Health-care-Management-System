import { ethers } from 'ethers';

// Connect to Ganache
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

// List of accounts from Ganache
const accounts = [
  '0x323E1E2Aa667DF2C33731eAd3F1d83BFF915035c',
  '0xBD0E0afb77ec5D554C91a3Aa7c0a630254011722',
  '0x03225F8595585d89147194a8548B5f410A170CE5',
  '0x411D269B9ac884EED551dc9912052463f9E0C9f5',
  '0xcfd0e581aB3fe2f4775D6E01000e447858827B8A',
  '0xc818F81e959DAB2a791A98841F27A44d7840Edd3',
  '0xfbc21b3e120326A0FcaAF3895D03883F476Be92D',
  '0x7C0Ce19194fFc7eF2D9aCEC6C16FD30B029e7efc',
  '0xC3b45124E9C6ceAC91D4711A6755df61C10ee168',
  '0xaf058608006346418c2016A36f08bA71bAF94DF3'
];

async function checkBalances() {
  console.log('Checking ETH balances for Ganache accounts...\n');
  
  try {
    for (let i = 0; i < accounts.length; i++) {
      const balance = await provider.getBalance(accounts[i]);
      const balanceInEth = ethers.formatEther(balance);
      console.log(`Account ${i}: ${accounts[i]}`);
      console.log(`Balance: ${balanceInEth} ETH\n`);
    }
  } catch (error) {
    console.error('Error checking balances:', error);
  }
}

checkBalances();