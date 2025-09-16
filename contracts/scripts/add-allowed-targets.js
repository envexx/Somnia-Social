const hre = require('hardhat');

async function main() {
  console.log('🔧 ADDING ALLOWED TARGETS TO BATCH RELAYER');
  console.log('==========================================');
  console.log('');

  try {
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log('📋 CONFIGURATION:');
    console.log(`Deployer Address: ${deployer.address}`);
    console.log('');

    // Contract addresses
    const POST_FEED_ADDRESS = '0x3feeF59e911f0B2cC641711AAf7fB20F5DE7331A';
    const REACTIONS_ADDRESS = '0xdE8abe80D03Aa65E8683AA4eEdFa0690B3408d7F';
    const BATCH_RELAYER_ADDRESS = '0xC7cFc7a96150816176C44F0CcD1066a781CEEB82';

    console.log(`PostFeed: ${POST_FEED_ADDRESS}`);
    console.log(`Reactions: ${REACTIONS_ADDRESS}`);
    console.log(`BatchRelayer: ${BATCH_RELAYER_ADDRESS}`);
    console.log('');

    // Create BatchRelayer contract instance
    const batchRelayer = await hre.ethers.getContractAt('BatchRelayer', BATCH_RELAYER_ADDRESS);
    
    // Check if deployer is owner
    console.log('1️⃣  CHECKING OWNERSHIP...');
    const owner = await batchRelayer.owner();
    console.log(`   Contract Owner: ${owner}`);
    console.log(`   Deployer Address: ${deployer.address}`);
    console.log(`   Is Owner: ${owner.toLowerCase() === deployer.address.toLowerCase() ? '✅ YES' : '❌ NO'}`);
    console.log('');

    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log('❌ ERROR: Deployer is not the owner of BatchRelayer contract');
      console.log('   Cannot add allowed targets');
      return;
    }

    // Check current allowance status
    console.log('2️⃣  CHECKING CURRENT ALLOWANCE...');
    const postFeedAllowed = await batchRelayer.allowedTargets(POST_FEED_ADDRESS);
    const reactionsAllowed = await batchRelayer.allowedTargets(REACTIONS_ADDRESS);
    
    console.log(`   PostFeed Allowed: ${postFeedAllowed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Reactions Allowed: ${reactionsAllowed ? '✅ YES' : '❌ NO'}`);
    console.log('');

    // Add PostFeed to allowed targets
    if (!postFeedAllowed) {
      console.log('3️⃣  ADDING POSTFEED TO ALLOWED TARGETS...');
      try {
        const tx = await batchRelayer.setAllowedTarget(POST_FEED_ADDRESS, true);
        console.log(`   Transaction submitted: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`   Transaction confirmed: Block ${receipt.blockNumber}`);
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
        console.log('   ✅ PostFeed added to allowed targets');
      } catch (error) {
        console.log(`   ❌ Error adding PostFeed: ${error.message}`);
      }
    } else {
      console.log('3️⃣  POSTFEED ALREADY ALLOWED ✅');
    }
    console.log('');

    // Add Reactions to allowed targets
    if (!reactionsAllowed) {
      console.log('4️⃣  ADDING REACTIONS TO ALLOWED TARGETS...');
      try {
        const tx = await batchRelayer.setAllowedTarget(REACTIONS_ADDRESS, true);
        console.log(`   Transaction submitted: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`   Transaction confirmed: Block ${receipt.blockNumber}`);
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
        console.log('   ✅ Reactions added to allowed targets');
      } catch (error) {
        console.log(`   ❌ Error adding Reactions: ${error.message}`);
      }
    } else {
      console.log('4️⃣  REACTIONS ALREADY ALLOWED ✅');
    }
    console.log('');

    // Verify final status
    console.log('5️⃣  VERIFYING FINAL STATUS...');
    const finalPostFeedAllowed = await batchRelayer.allowedTargets(POST_FEED_ADDRESS);
    const finalReactionsAllowed = await batchRelayer.allowedTargets(REACTIONS_ADDRESS);
    
    console.log(`   PostFeed Allowed: ${finalPostFeedAllowed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Reactions Allowed: ${finalReactionsAllowed ? '✅ YES' : '❌ NO'}`);
    console.log('');

    if (finalPostFeedAllowed && finalReactionsAllowed) {
      console.log('🎉 SUCCESS! All contracts are now allowed for gasless transactions');
      console.log('');
      console.log('✅ PostFeed: Ready for gasless post creation');
      console.log('✅ Reactions: Ready for gasless like/unlike');
      console.log('');
      console.log('🚀 Gasless transactions should now work!');
    } else {
      console.log('❌ Some contracts are still not allowed');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
