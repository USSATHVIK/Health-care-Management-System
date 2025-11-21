const fs = require('fs');
const path = require('path');

async function main() {
    const provider = ethers.provider;
    const signers = await ethers.getSigners();
    
    // Get first account with funds
    let deployer = null;
    for (const signer of signers) {
        const balance = await provider.getBalance(await signer.getAddress());
        if (balance.gt(0)) {
            deployer = signer;
            break;
        }
    }
    
    if (!deployer) {
        // Try Ganache directly
        const ganacheProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
        deployer = ganacheProvider.getSigner(0);
    }
    
    const deployerAddress = await deployer.getAddress();
    console.log('Deploying from:', deployerAddress);
    
    const InsuranceClaim = await ethers.getContractFactory('InsuranceClaim', deployer);
    const contract = await InsuranceClaim.deploy();
    await contract.deployed();
    
    console.log('CONTRACT_ADDRESS=' + contract.address);
    
    // Save to file
    fs.writeFileSync(path.join(__dirname, '.contract-address'), contract.address);
}

main().catch(console.error);
