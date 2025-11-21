require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: "0.8.0", // Use the same Solidity version as in your contract
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC URL
      accounts: ["0x980448358c56db3a5f75908f05ca146590a1de5a81a729e94d1623b7265087bd"], // Use the first account from Ganache (private key)
    },
  },
};