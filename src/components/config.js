import DocumentABI from "../contract/build/contracts/DocumentNotarization.json";

// Define chain IDs for validation and wallet checks
const CHAIN_IDS = {
  ganache: 1337,
  polygon: 137,
  ethereum: 1,
};

export const blockchainConfigs = {
  ganache: {
    name: "ganache",
    chainId: CHAIN_IDS.ganache,
    contractAddress: "0x9c74677bB0C0E31AaF4DcbEdD376dBF768Af618D",
    contractABI: DocumentABI,
    providerUrl: "http://127.0.0.1:7545",
  },

  polygon: {
    name: "polygon",
    chainId: CHAIN_IDS.polygon,
    contractAddress: "0xYourPolygonAddress", // Replace with actual deployed contract
    contractABI: DocumentABI,
    providerUrl: "https://polygon-rpc.com",
  },

  ethereum: {
    name: "ethereum",
    chainId: CHAIN_IDS.ethereum,
    contractAddress: "0xYourEthereumAddress", // Replace with actual deployed contract
    contractABI: DocumentABI,
    providerUrl: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID", // Replace YOUR_PROJECT_ID
  },
};

// Optional: Get config by environment or chain name
export const getBlockchainConfig = (env = "ganache") => {
  if (!blockchainConfigs[env]) {
    throw new Error(`Blockchain config for '${env}' not found`);
  }
  return blockchainConfigs[env];
};
