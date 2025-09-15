const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("Deploying Somnia Social contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy TrustedForwarder first
  console.log("Deploying TrustedForwarder...");
  const TrustedForwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await TrustedForwarder.deploy();
  await forwarder.deployed();
  const forwarderAddress = forwarder.address;
  console.log("TrustedForwarder deployed to:", forwarderAddress);

  // Deploy ProfileRegistry
  console.log("Deploying ProfileRegistry...");
  const ProfileRegistry = await ethers.getContractFactory("ProfileRegistry");
  const profileRegistry = await ProfileRegistry.deploy(forwarderAddress);
  await profileRegistry.deployed();
  const profileRegistryAddress = profileRegistry.address;
  console.log("ProfileRegistry deployed to:", profileRegistryAddress);

  // Deploy PostFeed
  console.log("Deploying PostFeed...");
  const PostFeed = await ethers.getContractFactory("PostFeed");
  const postFeed = await PostFeed.deploy(forwarderAddress);
  await postFeed.deployed();
  const postFeedAddress = postFeed.address;
  console.log("PostFeed deployed to:", postFeedAddress);

  // Deploy Reactions
  console.log("Deploying Reactions...");
  const Reactions = await ethers.getContractFactory("Reactions");
  const reactions = await Reactions.deploy(forwarderAddress);
  await reactions.deployed();
  const reactionsAddress = reactions.address;
  console.log("Reactions deployed to:", reactionsAddress);

  // Deploy Badges
  console.log("Deploying Badges...");
  const Badges = await ethers.getContractFactory("Badges");
  const badges = await Badges.deploy(forwarderAddress);
  await badges.deployed();
  const badgesAddress = badges.address;
  console.log("Badges deployed to:", badgesAddress);

  // Deploy BatchRelayer
  console.log("Deploying BatchRelayer...");
  const BatchRelayer = await ethers.getContractFactory("BatchRelayer");
  const batchRelayer = await BatchRelayer.deploy(forwarderAddress, deployer.address);
  await batchRelayer.deployed();
  const batchRelayerAddress = batchRelayer.address;
  console.log("BatchRelayer deployed to:", batchRelayerAddress);

  // Setup contract relationships
  console.log("Setting up contract relationships...");
  
  // Set reactions contract in PostFeed
  await postFeed.setReactionsContract(reactionsAddress);
  console.log("PostFeed reactions contract set to:", reactionsAddress);
  
  // Set post feed contract in Reactions
  await reactions.setPostFeedContract(postFeedAddress);
  console.log("Reactions post feed contract set to:", postFeedAddress);

  // Set allowed targets in BatchRelayer
  const allowedTargets = [profileRegistryAddress, postFeedAddress, reactionsAddress, badgesAddress];
  const allowedStatuses = [true, true, true, true];
  await batchRelayer.batchSetAllowedTargets(allowedTargets, allowedStatuses);
  console.log("BatchRelayer allowed targets set");

  // Save contract addresses
  const contractAddresses = {
    TrustedForwarder: forwarderAddress,
    ProfileRegistry: profileRegistryAddress,
    PostFeed: postFeedAddress,
    Reactions: reactionsAddress,
    Badges: badgesAddress,
    BatchRelayer: batchRelayerAddress,
    network: "somnia",
    chainId: 50312,
    rpcUrl: "https://dream-rpc.somnia.network",
    blockExplorer: "https://somnia-testnet.socialscan.io"
  };

  console.log("\n=== Contract Addresses ===");
  console.log(JSON.stringify(contractAddresses, null, 2));

  // Save to file for frontend use
  fs.writeFileSync(
    '../frontend/src/contracts/addresses.json',
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("\nContract addresses saved to frontend/src/contracts/addresses.json");
  
  console.log("\n=== Deployment Summary ===");
  console.log("✅ TrustedForwarder: Gasless transaction support");
  console.log("✅ ProfileRegistry: User profile management with unique handles");
  console.log("✅ PostFeed: Post and comment system with IPFS storage");
  console.log("✅ Reactions: Like toggle system with counter sync");
  console.log("✅ Badges: Non-transferable tier-based achievement system");
  console.log("✅ BatchRelayer: Gasless batch transaction execution");
  console.log("\n🎉 Somnia Social MVP deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
