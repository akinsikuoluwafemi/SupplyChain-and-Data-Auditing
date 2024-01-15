const Ownable = artifacts.require("Ownable");
const SupplyChain = artifacts.require("SupplyChain");

module.exports = function (deployer) {
  // Deploy Ownable.sol first with an initial amount of Ether
  deployer
    .deploy(Ownable, { value: web3.utils.toWei(".002", "ether") })
    .then(() => {
      // After Ownable.sol is deployed, deploy SupplyChain.sol
      return deployer.deploy(SupplyChain);
    });
};
