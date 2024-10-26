// 2_deploy_document_notarization.js

const DocumentNotarization = artifacts.require("DocumentNotarization");

module.exports = function (deployer) {
  deployer.deploy(DocumentNotarization);
};
