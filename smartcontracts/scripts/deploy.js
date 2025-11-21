// async function main() {
//     // Get the signers (accounts) connected to the network
//     const [deployer] = await ethers.getSigners();
//     console.log("Deploying contracts with the account:", deployer.address);
  
//     // Compile the contract (if you haven't already)
//     await hre.run('compile');
  
//     // Get the contract factory
//     const InsuranceClaim = await ethers.getContractFactory("InsuranceClaim");
  
//     // Deploy the contract
//     const insuranceClaim = await InsuranceClaim.deploy();
//     console.log("InsuranceClaim contract deployed to:", insuranceClaim.address);
//   }
  
//   // Run the deployment script
//   main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error(error);
//       process.exit(1);
//     });
    

async function main() {
    // Get the provider from Hardhat
    const provider = ethers.provider;
    
    // Get all signers
    const signers = await ethers.getSigners();
    
    if (signers.length === 0) {
        throw new Error('No signers found. Please check your Hardhat network configuration.');
    }
    
    // Try each signer until we find one with funds
    let deployer = null;
    let deployerAddress = null;
    
    for (const signer of signers) {
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        console.log(`Checking account ${address}: ${ethers.utils.formatEther(balance)} ETH`);
        
        if (balance.gt(0)) {
            deployer = signer;
            deployerAddress = address;
            console.log(`✅ Using account with funds: ${address}`);
            break;
        }
    }
    
    if (!deployer) {
        // If no signer has funds, try to get the first account from Ganache directly
        console.log('No configured signer has funds. Trying to get first account from Ganache...');
        const ganacheProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
        const accounts = await ganacheProvider.listAccounts();
        
        if (accounts.length > 0) {
            deployer = ganacheProvider.getSigner(0);
            deployerAddress = await deployer.getAddress();
            const balance = await ganacheProvider.getBalance(deployerAddress);
            console.log(`Using Ganache account: ${deployerAddress} (${ethers.utils.formatEther(balance)} ETH)`);
            
            if (balance.eq(0)) {
                throw new Error('First Ganache account has no funds. Please ensure Ganache is running and accounts are funded.');
            }
        } else {
            throw new Error('No accounts found in Ganache. Please ensure Ganache is running on http://127.0.0.1:7545');
        }
    }

    console.log("\nDeploying contracts with the account:", deployerAddress);

    // Get the contract factory
    const InsuranceClaim = await ethers.getContractFactory("InsuranceClaim", deployer);

    // Deploy the contract
    console.log("Deploying InsuranceClaim contract...");
    const insuranceClaim = await InsuranceClaim.deploy();
    await insuranceClaim.deployed();
    console.log("\n✅ InsuranceClaim contract deployed to:", insuranceClaim.address);
    console.log("\n📋 Please update the contract address in backend/routes/claimSubmissionRoutes.js");
    console.log("   Line 144: const contractAddress = '" + insuranceClaim.address + "';");
}

// Run the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
