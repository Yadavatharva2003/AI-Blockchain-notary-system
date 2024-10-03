// Import the contract artifact
const MultiPartyNotarization = artifacts.require("MultiPartyNotarization");

module.exports = function (deployer) {
  // Deploy the contract
  deployer.deploy(MultiPartyNotarization)
    .then(instance => {
      // Log the contract address after it has been deployed
      console.log("MultiPartyNotarization contract deployed at:", instance.address);
    });
};
