/**
 * Utility function to generate a unique CID for testing purposes
 * In a real application, this would be replaced with actual IPFS integration
 */

// Simple function to generate a pseudo-random CID-like string
function generateUniqueCID() {
  // Generate a random string that looks like an IPFS CID (Qm prefix + 44 random chars)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'Qm'; // IPFS CIDv0 prefix
  
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Function to generate a unique CID based on timestamp and random data
function generateTimestampBasedCID() {
  const timestamp = Date.now().toString();
  const randomPart = Math.random().toString(36).substring(2, 15);
  const uniqueString = timestamp + randomPart;
  
  // Simple hash-like function to create a CID-like string
  let hash = 0;
  for (let i = 0; i < uniqueString.length; i++) {
    const char = uniqueString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to a positive hex string and pad to appropriate length
  const hexString = Math.abs(hash).toString(16).padStart(44, '0').substring(0, 44);
  
  return 'Qm' + hexString;
}

module.exports = {
  generateUniqueCID,
  generateTimestampBasedCID
};