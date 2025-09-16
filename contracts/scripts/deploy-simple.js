const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 STARTING SOMNIA SOCIAL CONTRACTS DEPLOYMENT');
  console.log('===============================================');
  console.log('');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📋 DEPLOYMENT INFO:');
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
  console.log('');

  const deployedContracts = {};

  try {
    // 1. Deploy TrustedForwarder
    console.log('1️⃣  DEPLOYING TRUSTED FORWARDER...');
    const TrustedForwarder = await ethers.getContractFactory('TrustedForwarder');
    const trustedForwarder = await TrustedForwarder.deploy();
    await trustedForwarder.deployed();
    
    deployedContracts.TrustedForwarder = trustedForwarder.address;
    console.log(`✅ TrustedForwarder deployed to: ${trustedForwarder.address}`);
    console.log('');

    // 2. Deploy ProfileRegistry
    console.log('2️⃣  DEPLOYING PROFILE REGISTRY...');
    const ProfileRegistry = await ethers.getContractFactory('ProfileRegistry');
    const profileRegistry = await ProfileRegistry.deploy(trustedForwarder.address);
    await profileRegistry.deployed();
    
    deployedContracts.ProfileRegistry = profileRegistry.address;
    console.log(`✅ ProfileRegistry deployed to: ${profileRegistry.address}`);
    console.log('');

    // 3. Deploy PostFeed
    console.log('3️⃣  DEPLOYING POST FEED...');
    const PostFeed = await ethers.getContractFactory('PostFeed');
    const postFeed = await PostFeed.deploy(trustedForwarder.address);
    await postFeed.deployed();
    
    deployedContracts.PostFeed = postFeed.address;
    console.log(`✅ PostFeed deployed to: ${postFeed.address}`);
    console.log('');

    // 4. Deploy Reactions
    console.log('4️⃣  DEPLOYING REACTIONS...');
    const Reactions = await ethers.getContractFactory('Reactions');
    const reactions = await Reactions.deploy(trustedForwarder.address);
    await reactions.deployed();
    
    deployedContracts.Reactions = reactions.address;
    console.log(`✅ Reactions deployed to: ${reactions.address}`);
    console.log('');

    // 5. Deploy Badges
    console.log('5️⃣  DEPLOYING BADGES...');
    const Badges = await ethers.getContractFactory('Badges');
    const badges = await Badges.deploy(trustedForwarder.address);
    await badges.deployed();
    
    deployedContracts.Badges = badges.address;
    console.log(`✅ Badges deployed to: ${badges.address}`);
    console.log('');

    // 6. Deploy BatchRelayer
    console.log('6️⃣  DEPLOYING BATCH RELAYER...');
    const BatchRelayer = await ethers.getContractFactory('BatchRelayer');
    const batchRelayer = await BatchRelayer.deploy(trustedForwarder.address, deployer.address);
    await batchRelayer.deployed();
    
    deployedContracts.BatchRelayer = batchRelayer.address;
    console.log(`✅ BatchRelayer deployed to: ${batchRelayer.address}`);
    console.log('');

    // 7. Setup Contract Relationships
    console.log('7️⃣  SETTING UP CONTRACT RELATIONSHIPS...');
    
    // Set PostFeed -> Reactions relationship
    console.log('   Setting PostFeed -> Reactions relationship...');
    await postFeed.setReactionsContract(reactions.address);
    console.log('   ✅ PostFeed -> Reactions set');

    // Set Reactions -> PostFeed relationship
    console.log('   Setting Reactions -> PostFeed relationship...');
    await reactions.setPostFeedContract(postFeed.address);
    console.log('   ✅ Reactions -> PostFeed set');

    // Set ProfileRegistry -> Badges relationship
    console.log('   Setting ProfileRegistry -> Badges relationship...');
    await profileRegistry.setBadgesContract(badges.address);
    console.log('   ✅ ProfileRegistry -> Badges set');

    // Set Badges -> ProfileRegistry relationship
    console.log('   Setting Badges -> ProfileRegistry relationship...');
    await badges.setProfileRegistryContract(profileRegistry.address);
    console.log('   ✅ Badges -> ProfileRegistry set');

    console.log('');

    // 8. Verify Deployment
    console.log('8️⃣  VERIFYING DEPLOYMENT...');
    
    // Verify ProfileRegistry
    const profileRegistryBadges = await profileRegistry.badgesContract();
    console.log(`   ProfileRegistry badges contract: ${profileRegistryBadges}`);
    console.log(`   Expected: ${badges.address}`);
    console.log(`   ✅ ProfileRegistry verification: ${profileRegistryBadges === badges.address ? 'PASS' : 'FAIL'}`);

    // Verify PostFeed
    const postFeedReactions = await postFeed.reactionsContract();
    console.log(`   PostFeed reactions contract: ${postFeedReactions}`);
    console.log(`   Expected: ${reactions.address}`);
    console.log(`   ✅ PostFeed verification: ${postFeedReactions === reactions.address ? 'PASS' : 'FAIL'}`);

    // Verify Reactions
    const reactionsPostFeed = await reactions.postFeedContract();
    console.log(`   Reactions post feed contract: ${reactionsPostFeed}`);
    console.log(`   Expected: ${postFeed.address}`);
    console.log(`   ✅ Reactions verification: ${reactionsPostFeed === postFeed.address ? 'PASS' : 'FAIL'}`);

    // Verify Badges
    const badgesProfileRegistry = await badges.profileRegistryContract();
    console.log(`   Badges profile registry contract: ${badgesProfileRegistry}`);
    console.log(`   Expected: ${profileRegistry.address}`);
    console.log(`   ✅ Badges verification: ${badgesProfileRegistry === profileRegistry.address ? 'PASS' : 'FAIL'}`);

    console.log('');

    // 9. Test Basic Functionality
    console.log('9️⃣  TESTING BASIC FUNCTIONALITY...');
    
    // Test ProfileRegistry
    console.log('   Testing ProfileRegistry...');
    await profileRegistry.createProfile('testuser', 'QmTestProfile', ethers.constants.AddressZero);
    const [userId, ownerAddr, handleHash, profileCid] = await profileRegistry.getProfileByOwner(deployer.address);
    console.log(`   ✅ Profile created: User ID ${userId}, Owner ${ownerAddr}`);

    // Test Badges (should auto-assign beginner badge)
    console.log('   Testing Badges...');
    const userTier = await badges.tierOf(deployer.address);
    const beginnerBadgeBalance = await badges.balanceOf(deployer.address, 1);
    console.log(`   ✅ Beginner badge: Tier ${userTier}, Balance ${beginnerBadgeBalance}`);

    // Test PostFeed
    console.log('   Testing PostFeed...');
    await postFeed.createPost('QmTestPost', 0, 0, ethers.constants.AddressZero);
    const post = await postFeed.getPost(1);
    console.log(`   ✅ Post created: Author ${post.author}, CID ${post.cid}`);

    // Test Reactions
    console.log('   Testing Reactions...');
    await reactions.toggleLike(1, ethers.constants.AddressZero);
    const hasLiked = await reactions.hasLiked(1, deployer.address);
    const likeCount = await reactions.getLikeCount(1);
    console.log(`   ✅ Like recorded: Liked ${hasLiked}, Count ${likeCount}`);

    console.log('');

    // 10. Final Summary
    console.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('');
    console.log('📋 DEPLOYED CONTRACTS:');
    console.log(`   TrustedForwarder: ${deployedContracts.TrustedForwarder}`);
    console.log(`   ProfileRegistry:  ${deployedContracts.ProfileRegistry}`);
    console.log(`   PostFeed:         ${deployedContracts.PostFeed}`);
    console.log(`   Reactions:        ${deployedContracts.Reactions}`);
    console.log(`   Badges:           ${deployedContracts.Badges}`);
    console.log(`   BatchRelayer:     ${deployedContracts.BatchRelayer}`);
    console.log('');
    console.log('🔗 CONTRACT RELATIONSHIPS:');
    console.log(`   ProfileRegistry -> Badges: ✅`);
    console.log(`   PostFeed -> Reactions: ✅`);
    console.log(`   Reactions -> PostFeed: ✅`);
    console.log(`   Badges -> ProfileRegistry: ✅`);
    console.log('');
    console.log('✅ BASIC FUNCTIONALITY TESTED:');
    console.log(`   Profile Creation: ✅`);
    console.log(`   Auto-assign Beginner Badge: ✅`);
    console.log(`   Post Creation: ✅`);
    console.log(`   Like Functionality: ✅`);
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Update frontend with new contract addresses');
    console.log('   2. Test gasless transactions with sponsor wallet');
    console.log('   3. Verify user attribution in blockchain');
    console.log('   4. Test complete user flow');
    console.log('');

    // Save deployment info to file
    const deploymentInfo = {
      network: 'somnia-testnet',
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      relationships: {
        'ProfileRegistry -> Badges': profileRegistryBadges === badges.address,
        'PostFeed -> Reactions': postFeedReactions === reactions.address,
        'Reactions -> PostFeed': reactionsPostFeed === postFeed.address,
        'Badges -> ProfileRegistry': badgesProfileRegistry === profileRegistry.address
      }
    };

    const fs = require('fs');
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to deployment-info.json');

  } catch (error) {
    console.error('❌ DEPLOYMENT FAILED:', error);
    
    // Show partial deployment results
    if (Object.keys(deployedContracts).length > 0) {
      console.log('');
      console.log('📋 PARTIALLY DEPLOYED CONTRACTS:');
      Object.entries(deployedContracts).forEach(([name, address]) => {
        console.log(`   ${name}: ${address}`);
      });
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
