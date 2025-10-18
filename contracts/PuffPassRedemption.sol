// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PuffPassRedemption
 * @notice Allows customers to redeem PUFF tokens for USDC, funded by the Puff Vault
 * @dev Redemption rate: 100 PUFF = $1 USDC
 */
contract PuffPassRedemption is ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable puffToken;
    IERC20 public immutable usdcToken;

    // 100 PUFF = $1 USDC (PUFF has 18 decimals, USDC has 6)
    uint256 public constant REDEMPTION_RATE = 100;
    uint256 public constant PUFF_DECIMALS = 18;
    uint256 public constant USDC_DECIMALS = 6;

    bytes32 public constant VAULT_MANAGER_ROLE = keccak256("VAULT_MANAGER_ROLE");

    // Redemption tracking
    uint256 public totalRedeemed;
    uint256 public totalUsdcPaid;
    mapping(address => uint256) public userRedemptions;

    // Events
    event Redeemed(address indexed user, uint256 puffAmount, uint256 usdcAmount);
    event VaultFunded(address indexed funder, uint256 amount);
    event EmergencyWithdraw(address indexed admin, uint256 amount);

    constructor(address _puffToken, address _usdcToken) {
        require(_puffToken != address(0), "Invalid PUFF token address");
        require(_usdcToken != address(0), "Invalid USDC token address");
        
        puffToken = IERC20(_puffToken);
        usdcToken = IERC20(_usdcToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VAULT_MANAGER_ROLE, msg.sender);
    }

    /**
     * @notice Customer redeems PUFF for USDC (funded by Puff Vault)
     * @param puffAmount Amount of PUFF tokens to redeem (must be multiple of 100 PUFF)
     */
    function redeem(uint256 puffAmount) external nonReentrant whenNotPaused {
        require(puffAmount > 0, "Amount must be greater than 0");
        require(puffAmount >= 100 * 10**PUFF_DECIMALS, "Minimum 100 PUFF required");
        require(puffAmount % (100 * 10**PUFF_DECIMALS) == 0, "Must be multiple of 100 PUFF");

        // Calculate USDC amount: (puffAmount / 10^18) / 100 * 10^6
        uint256 usdcAmount = (puffAmount / 10**PUFF_DECIMALS) * 10**USDC_DECIMALS / REDEMPTION_RATE;

        // Ensure Puff Vault has enough USDC
        require(usdcToken.balanceOf(address(this)) >= usdcAmount, "Insufficient Puff Vault reserves");

        // Transfer PUFF from user and burn
        puffToken.safeTransferFrom(msg.sender, address(this), puffAmount);
        
        // Note: Actual burning would require PUFF token to have burn function
        // For now, tokens are held in contract (effectively removed from circulation)

        // Send USDC from Puff Vault to user
        usdcToken.safeTransfer(msg.sender, usdcAmount);

        // Update tracking
        totalRedeemed += puffAmount;
        totalUsdcPaid += usdcAmount;
        userRedemptions[msg.sender] += puffAmount;

        emit Redeemed(msg.sender, puffAmount, usdcAmount);
    }

    /**
     * @notice Admin adds USDC to Puff Vault (from withdrawal fees, transaction fees, etc.)
     * @param amount Amount of USDC to add to vault
     */
    function fundVault(uint256 amount) external onlyRole(VAULT_MANAGER_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        emit VaultFunded(msg.sender, amount);
    }

    /**
     * @notice Get current vault balance
     * @return USDC balance available for redemptions
     */
    function getVaultBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @notice Calculate USDC amount for given PUFF amount
     * @param puffAmount Amount of PUFF tokens
     * @return USDC amount that would be received
     */
    function calculateRedemption(uint256 puffAmount) external pure returns (uint256) {
        return (puffAmount / 10**PUFF_DECIMALS) * 10**USDC_DECIMALS / REDEMPTION_RATE;
    }

    /**
     * @notice Pause redemptions (emergency use only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause redemptions
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Emergency withdraw (admin only, for contract migration)
     * @param amount Amount of USDC to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= usdcToken.balanceOf(address(this)), "Insufficient balance");
        usdcToken.safeTransfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, amount);
    }
}
