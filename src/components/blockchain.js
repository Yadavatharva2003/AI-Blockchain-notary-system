import {
  BrowserProvider,
  Contract,
  isAddress,
  keccak256,
  toUtf8Bytes,
} from "ethers";
import { ethers } from "ethers";
import contractABI from "../contract/build/contracts/DocumentNotarization.json";

// Configuration for multiple Ganache networks
const ganacheNetworks = {
  ganache1: {
    chainId: "0x539", // 1337 decimal
    chainName: "Ethereum test",
    rpcUrl: "http://127.0.0.1:7545",
    contractAddress: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  ganache2: {
    chainId: "0x562", // 31337 decimal (local Ganache Polygon simulation)
    chainName: "Polygontest",
    rpcUrl: "http://127.0.0.1:8546",
    contractAddress: "0x5fbdb2315678afecb367f032d93f642f64180aa3", // Example address, replace with actual
    nativeCurrency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  // Add more Ganache networks here as needed
  ganache3: {
    chainId: "0x15e0", // 31344 decimal (local Ganache Binance simulation)
    chainName: "Binancetest",
    rpcUrl: "http://127.0.0.1:8547",
    contractAddress: "0x5fbdb2315678afecb367f032d93f642f64180aa3", // Example address, replace with actual
    nativeCurrency: {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18,
    },
  },
};

let isConnecting = false;
let connectionPromise = null;
let currentNetworkKey = "ganache1"; // Default network key

export const setCurrentNetwork = (networkKey) => {
  if (!ganacheNetworks[networkKey]) {
    throw new Error(`Network key ${networkKey} is not configured`);
  }
  currentNetworkKey = networkKey;
};

export const getCurrentNetwork = () => {
  return ganacheNetworks[currentNetworkKey];
};

export const checkAndSwitchNetwork = async (networkKey = currentNetworkKey) => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed");
  }

  if (!ganacheNetworks[networkKey]) {
    throw new Error(`Network key ${networkKey} is not configured`);
  }

  const network = ganacheNetworks[networkKey];

  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    // Normalize chainId values to decimal numbers for comparison
    const currentChainIdDecimal = parseInt(chainId, 16);
    const targetChainIdDecimal = parseInt(network.chainId, 16);

    if (currentChainIdDecimal !== targetChainIdDecimal) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: network.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: network.chainId,
                chainName: network.chainName,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [],
              },
            ],
          });
          // Retry switching after adding the chain
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: network.chainId }],
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

const connectToMetaMask = async (networkKey = currentNetworkKey) => {
  if (isConnecting) {
    return connectionPromise;
  }

  if (!ganacheNetworks[networkKey]) {
    throw new Error(`Network key ${networkKey} is not configured`);
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned by MetaMask");
      }

      // Use BrowserProvider for all networks to ensure signer support
      let provider = new ethers.BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress(); // ✅ Must be awaited

      if (!isAddress(signerAddress)) {
        throw new Error(`Invalid signer address: ${signerAddress}`);
      }

      const contract = new ethers.Contract(
        ganacheNetworks[networkKey].contractAddress,
        contractABI.abi,
        signer
      );
      return { provider, signer, contract };
    } catch (error) {
      console.error("Error connecting to blockchain:", error);
      if (error.code === 4001) {
        throw new Error("User rejected the connection request");
      } else if (error.code === -32002) {
        throw new Error("MetaMask is already processing a connection request");
      } else {
        throw new Error("Failed to connect to the blockchain");
      }
    } finally {
      isConnecting = false;
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

export const getBlockchainData = async (networkKey = currentNetworkKey) => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed");
  }
  return connectToMetaMask(networkKey);
};

// Notarize a document
export const notarizeDocument = async (
  document,
  expirationDuration,
  networkKey = currentNetworkKey
) => {
  try {
    let documentHash;

    if (typeof document === "string") {
      documentHash = document.startsWith("0x") ? document : `0x${document}`;
    } else if (document instanceof Blob) {
      documentHash = await hashDocument(document);
    } else {
      throw new Error(
        "Invalid input: must be either a file object or a hash string"
      );
    }
    const { contract } = await getBlockchainData(networkKey);

    const expirationInSeconds = expirationDuration * 24 * 60 * 60;

    const gasLimit = 6000000;

    const tx = await contract.notarizeDocument(
      documentHash,
      expirationInSeconds,
      {
        gasLimit: gasLimit,
      }
    );
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
export const revokeNotarization = async (
  documentContent,
  networkKey = currentNetworkKey
) => {
  try {
    const documentHash = await hashDocument(documentContent);
    const { contract } = await getBlockchainData(networkKey);

    const gasLimit = 6000000;

    const tx = await contract.revokeNotarization(documentHash, {
      gasLimit: gasLimit,
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
export const isDocumentNotarized = async (
  document,
  networkKey = currentNetworkKey
) => {
  try {
    let documentHash;

    if (typeof document === "string") {
      documentHash = document.startsWith("0x") ? document : `0x${document}`;
    } else if (document instanceof Blob) {
      documentHash = await hashDocument(document);
    } else {
      throw new Error(
        "Invalid input: must be either a file object or a hash string"
      );
    }

    const { contract } = await getBlockchainData(networkKey);
    const isNotarized = await contract.isDocumentNotarized(documentHash);
    console.log("Is document notarized:", isNotarized);
    return isNotarized;
  } catch (error) {
    console.error("Error checking document notarization:", error);
    throw error;
  }
};

// Check if document is expired
export const isDocumentExpired = async (
  documentHash,
  networkKey = currentNetworkKey
) => {
  try {
    const formattedHash = documentHash.startsWith("0x")
      ? documentHash
      : `0x${documentHash}`;
    const { contract } = await getBlockchainData(networkKey);
    return await contract.isDocumentExpired(formattedHash);
  } catch (error) {
    console.error("Error checking document expiration:", error);
    throw error;
  }
};

// Search documents by notary
export const searchDocumentsByNotary = async (
  notaryAddress,
  networkKey = currentNetworkKey
) => {
  try {
    if (!isAddress(notaryAddress)) {
      throw new Error("Invalid notary address");
    }

    const { contract } = await getBlockchainData(networkKey);
    const documents = await contract.searchDocumentsByNotary(notaryAddress);
    console.log("Documents found:", documents);
    return documents;
  } catch (error) {
    console.error("Error searching documents:", error);
    throw error;
  }
};

// Get document details
export const getDocumentDetails = async (
  document,
  networkKey = currentNetworkKey
) => {
  try {
    let documentHash;

    if (typeof document === "string") {
      documentHash = document.startsWith("0x") ? document : `0x${document}`;
    } else if (document instanceof Blob) {
      documentHash = await hashDocument(document);
    } else {
      throw new Error(
        "Invalid input: must be either a file object or a hash string"
      );
    }

    const { contract } = await getBlockchainData(networkKey);

    const documentDetails = await contract.documents(documentHash);
    return {
      notary: documentDetails.notary,
      notarizationTime: Number(documentDetails.notarizationTime),
      exists: documentDetails.exists,
      revoked: documentDetails.revoked,
      expirationTime: Number(documentDetails.expirationTime),
    };
  } catch (error) {
    console.error("Error getting document details:", error);
    throw error;
  }
};

// Hash the document content
export const hashDocument = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const hash = keccak256(new Uint8Array(arrayBuffer));
      resolve(hash);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Get current account
export const getCurrentAccount = async (networkKey = currentNetworkKey) => {
  try {
    const { signer } = await getBlockchainData(networkKey);
    return await signer.getAddress();
  } catch (error) {
    console.error("Error getting current account:", error);
    throw error;
  }
};

// Listen for account changes
export const addAccountsChangedListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", callback);
  }
};

// Listen for chain changes
export const addChainChangedListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on("chainChanged", callback);
  }
};

// Remove event listeners when they're no longer needed
export const removeEventListeners = () => {
  if (window.ethereum) {
    window.ethereum.removeListener("accountsChanged", () => {});
    window.ethereum.removeListener("chainChanged", () => {});
  }
};

// Listen for DocumentNotarized events
export const listenToNotarizedEvents = async (
  callback,
  networkKey = currentNetworkKey
) => {
  try {
    const { contract } = await getBlockchainData(networkKey);
    contract.on("DocumentNotarized", callback);
  } catch (error) {
    console.error("Error listening to notarized events:", error);
    throw error;
  }
};

// Listen for NotarizationRevoked events
export const listenToRevokedEvents = async (
  callback,
  networkKey = currentNetworkKey
) => {
  try {
    const { contract } = await getBlockchainData(networkKey);
    contract.on("NotarizationRevoked", callback);
  } catch (error) {
    console.error("Error listening to revoked events:", error);
    throw error;
  }
};
