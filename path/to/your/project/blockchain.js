async function getBlockchainData() {
  try {
    // Check if Web3 is injected by MetaMask
    if (typeof window.ethereum !== 'undefined') {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create a new Web3 instance
      const web3 = new Web3(window.ethereum);
      
      // Get the network ID
      const networkId = await web3.eth.net.getId();
      
      // Get the deployed network data
      const deployedNetwork = YourContract.networks[networkId];
      
      if (!deployedNetwork) {
        throw new Error('Contract not deployed to detected network');
      }
      
      // Create a new contract instance
      const contract = new web3.eth.Contract(
        YourContract.abi,
        deployedNetwork.address
      );
      
      return { web3, contract };
    } else {
      throw new Error('Please install MetaMask!');
    }
  } catch (error) {
    console.error('Error in getBlockchainData:', error);
    throw new Error('Failed to connect to the blockchain');
  }
}