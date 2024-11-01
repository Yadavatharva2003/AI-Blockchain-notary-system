import { 
    BrowserProvider,
    Contract,
    isAddress,
    keccak256,
    toUtf8Bytes
} from 'ethers';
import { ethers } from 'ethers';
import contractABI from '../contract/build/contracts/DocumentNotarization.json';

const contractAddress = "0x9c74677bB0C0E31AaF4DcbEdD376dBF768Af618D";

let isConnecting = false;
let connectionPromise = null;

export const checkAndSwitchNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }
  
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const ganacheChainId = '0x539'; // Ganache default chain ID (1337 in decimal)
  
      if (chainId !== ganacheChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ganacheChainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: ganacheChainId,
                chainName: 'Ganache',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['http://127.0.0.1:7545'], // Default Ganache GUI RPC server
                blockExplorerUrls: [] // Ganache doesn't have a block explorer
              }],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
};

const connectToMetaMask = async () => {
  if (isConnecting) {
    return connectionPromise;
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
      return { provider, signer, contract };
    } catch (error) {
      console.error('Error connecting to blockchain:', error);
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      } else if (error.code === -32002) {
        throw new Error('MetaMask is already processing a connection request');
      } else {
        throw new Error('Failed to connect to the blockchain');
      }
    } finally {
      isConnecting = false;
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

export const getBlockchainData = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }
  return connectToMetaMask();
};

// Notarize a document
export const notarizeDocument = async (document, expirationDuration) => {
    try {
        let documentHash;

        // If the input is already a hash string
        if (typeof document === 'string') {
            // Add '0x' prefix if it's not already there
            documentHash = document.startsWith('0x') ? document : `0x${document}`;
        } 
        // If the input is a file object
        else if (document instanceof Blob) {
            documentHash = await hashDocument(document);
        } else {
            throw new Error('Invalid input: must be either a file object or a hash string');
        }
        const { contract } = await getBlockchainData();

        // Convert duration to seconds (assuming input is in days)
        const expirationInSeconds = expirationDuration * 24 * 60 * 60;

        // Use a conservative gas limit for Ganache
        const gasLimit = 6000000;

        const tx = await contract.notarizeDocument(documentHash, expirationInSeconds, {
            gasLimit: gasLimit
        });
        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Document notarized:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error notarizing document:", error);
        if (error.error) {
            console.error("Internal error:", error.error);
        }
        if (error.transaction) {
            console.error("Transaction details:", error.transaction);
        }
        throw error;
    }
};

// Revoke a notarization
export const revokeNotarization = async (documentContent) => {
    try {
        const documentHash = hashDocument(documentContent);
        const { contract } = await getBlockchainData();
        
        const gasLimit = 6000000;
        
        const tx = await contract.revokeNotarization(documentHash, {
            gasLimit: gasLimit
        });
        
        const receipt = await tx.wait();
        console.log("Notarization revoked:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error revoking notarization:", error);
        throw error;
    }
};

// Check if a document is notarized
export const isDocumentNotarized = async (document) => {
    try {
        let documentHash;
        
        // If the input is already a hash string
        if (typeof document === 'string') {
            // Add '0x' prefix if it's not already there
            documentHash = document.startsWith('0x') ? document : `0x${document}`;
        } 
        // If the input is a file object
        else if (document instanceof Blob) {
            documentHash = await hashDocument(document);
        } else {
            throw new Error('Invalid input: must be either a file object or a hash string');
        }

        const { contract } = await getBlockchainData();
        const isNotarized = await contract.isDocumentNotarized(documentHash);
        console.log("Is document notarized:", isNotarized);
        return isNotarized;
    } catch (error) {
        console.error("Error checking document notarization:", error);
        throw error;
    }
};

// Check if document is expired
export const isDocumentExpired = async (documentHash) => {
    try {
        const formattedHash = documentHash.startsWith('0x') ? documentHash : `0x${documentHash}`;
        const { contract } = await getBlockchainData();
        return await contract.isDocumentExpired(formattedHash);
    } catch (error) {
        console.error("Error checking document expiration:", error);
        throw error;
    }
};

// Search documents by notary
export const searchDocumentsByNotary = async (notaryAddress) => {
    try {
        if (!isAddress(notaryAddress)) {
            throw new Error("Invalid notary address");
        }
        
        const { contract } = await getBlockchainData();
        const documents = await contract.searchDocumentsByNotary(notaryAddress);
        console.log("Documents found:", documents);
        return documents;
    } catch (error) {
        console.error("Error searching documents:", error);
        throw error;
    }
};

// Get document details
export const getDocumentDetails = async (document) => {
    try {
        let documentHash;
        
        // If the input is already a hash string
        if (typeof document === 'string') {
            // Add '0x' prefix if it's not already there
            documentHash = document.startsWith('0x') ? document : `0x${document}`;
        } 
        // If the input is a file object
        else if (document instanceof Blob) {
            documentHash = await hashDocument(document);
        } else {
            throw new Error('Invalid input: must be either a file object or a hash string');
        }

        const { contract } = await getBlockchainData();
        
        const documentDetails = await contract.documents(documentHash);
        return {
            notary: documentDetails.notary,
            notarizationTime: Number(documentDetails.notarizationTime),
            exists: documentDetails.exists,
            revoked: documentDetails.revoked,
            expirationTime: Number(documentDetails.expirationTime)
        };
    } catch (error) {
        console.error("Error getting document details:", error);
        throw error;
    }
};

// Hash the document content
export const hashDocument = (file) => {
    return new Promise((resolve, reject) => {
      if (!(file instanceof Blob)) {
        reject(new Error("Invalid file object"));
        return;
      }
  
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsArrayBuffer(file);
    });
};

// Get current account
export const getCurrentAccount = async () => {
    try {
        const { signer } = await getBlockchainData();
        return await signer.getAddress();
    } catch (error) {
        console.error("Error getting current account:", error);
        throw error;
    }
};

// Listen for account changes
export const addAccountsChangedListener = (callback) => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', callback);
    }
};

// Listen for chain changes
export const addChainChangedListener = (callback) => {
    if (window.ethereum) {
        window.ethereum.on('chainChanged', callback);
    }
};

// Remove event listeners when they're no longer needed
export const removeEventListeners = () => {
    if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
    }
};

// Listen for DocumentNotarized events
export const listenToNotarizedEvents = async (callback) => {
    try {
        const { contract } = await getBlockchainData();
        contract.on('DocumentNotarized', callback);
    } catch (error) {
        console.error("Error listening to notarized events:", error);
        throw error;
    }
};

// Listen for NotarizationRevoked events
export const listenToRevokedEvents = async (callback) => {
    try {
        const { contract } = await getBlockchainData();
        contract.on('NotarizationRevoked', callback);
    } catch (error) {
        console.error("Error listening to revoked events:", error);
        throw error;
    }
};