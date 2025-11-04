// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PuffToken
 * @notice PUFF rewards token for the PuffPass cannabis platform
 * @dev ERC20 token with minting, burning, and permit functionality
 * 
 * Tokenomics:
 * - 100 PUFF = $1 USDC redemption value
 * - Earned through purchases (1 PUFF per $1 spent)
 * - Funded by merchant fees (10% of fees go to rewards pool)
 * - Burnable upon redemption
 */
contract PuffToken is ERC20, ERC20Burnable, ERC20Permit, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Maximum supply: 100 million PUFF tokens
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;

    // Tracking
    uint256 public totalMinted;
    uint256 public totalBurned;

    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);

    constructor() ERC20("PuffPass Rewards", "PUFF") ERC20Permit("PuffPass Rewards") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @notice Mint new PUFF tokens (rewards distribution)
     * @param to Recipient address
     * @param amount Amount to mint
     * @param reason Reason for minting (for audit trail)
     */
    function mint(address to, uint256 amount, string calldata reason) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");

        _mint(to, amount);
        totalMinted += amount;

        emit TokensMinted(to, amount, reason);
    }

    /**
     * @notice Burn tokens (called during redemption)
     * @param amount Amount to burn
     * @param reason Reason for burning (for audit trail)
     */
    function burnWithReason(uint256 amount, string calldata reason) external {
        require(amount > 0, "Amount must be greater than 0");
        
        _burn(msg.sender, amount);
        totalBurned += amount;

        emit TokensBurned(msg.sender, amount, reason);
    }

    /**
     * @notice Pause token transfers (emergency only)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @notice Get circulating supply (minted - burned)
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    /**
     * @notice Get remaining mintable supply
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
