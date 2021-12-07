// deploy/00_deploy_game_demo.js

const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("GameDemo", {
    from: deployer,
    log: true,
  });
};
module.exports.tags = ["GameDemo"];
