// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

/**
 * @title TrustedForwarder
 * @dev Minimal forwarder for gasless transactions using ERC-2771
 * @notice This is a wrapper around OpenZeppelin's MinimalForwarder
 */
contract TrustedForwarder is MinimalForwarder {
    constructor() MinimalForwarder() {}
}
