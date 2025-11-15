import { Web3 } from 'web3';

async function testBlockchain() {
  try {
    // Connect to the local Ganache network
    const web3 = new Web3('http://127.0.0.1:7545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    console.log('Available accounts:', accounts);
    
    // Get the contract address (from our deployment)
    const contractAddress = '0x2aFFffCBE4fFD3292Cc3A002f9A3977bA39F2509';
    
    // Simple ABI with just the admin function
    const contractABI = [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
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
      }
    ];
    
    // Create contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    // Call the admin function
    const admin = await contract.methods.admin().call();
    console.log('Contract admin:', admin);
    
    console.log('Blockchain connection test successful!');
  } catch (error) {
    console.error('Error testing blockchain connection:', error);
  }
}

testBlockchain();