require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: "0.8.0", // Use the same Solidity version as in your contract
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC URL
      accounts: ["0x3c08ee639006a5c4ca91718e5fbfa4bf3af382969bbc31bb6f5bafdf7b3bf00a"], // Use the first account from Ganache (private key)
    },
  },
};