// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PuffPassRouter
 * @notice Payment router for PuffPass that enforces 3% incoming fee and manages merchant vaults
 * @dev Merchants receive USDC via daily batch settlements (gasless for them)
 */
contract PuffPassRouter is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;
    address public treasury;
    
    // Merchant vault balances (net after 3% fee)
    mapping(address => uint256) public merchantVaults;
    
    // Base fee: 3% on all incoming payments
    uint256 public constant BASE_FEE_BPS = 300; // 300 basis points = 3%
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    // Withdrawal fees (for future use if merchants withdraw directly)
    uint256 public constant INSTANT_FEE_BPS = 700;  // 7%
    uint256 public constant DELAYED_FEE_BPS = 500;  // 5%
    
    event PaymentProcessed(
        address indexed merchant,
        address indexed payer,
        uint256 grossAmount,
        uint256 fee,
        uint256 netAmount
    );
    
    event MerchantWithdrawal(
        address indexed merchant,
        uint256 amount,
        uint256 fee,
        bool instant
    );
    
    event BatchSettlement(
        uint256 merchantCount,
        uint256 totalAmount
    );
    
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    
    constructor(address _usdc, address _treasury) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_treasury != address(0), "Invalid treasury address");
        usdc = IERC20(_usdc);
        treasury = _treasury;
    }
    
    /**
     * @notice Process a payment from user to merchant (3% fee deducted)
     * @param merchant The merchant receiving the payment
     * @param amount The gross payment amount (including fee)
     */
    function pay(address merchant, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(merchant != address(0), "Invalid merchant");
        
        uint256 fee = (amount * BASE_FEE_BPS) / BPS_DENOMINATOR;
        uint256 netAmount = amount - fee;
        
        // Transfer full amount from payer
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Send fee to treasury immediately
        require(usdc.transfer(treasury, fee), "Fee transfer failed");
        
        // Credit merchant vault (they'll receive via batch settlement)
        merchantVaults[merchant] += netAmount;
        
        emit PaymentProcessed(merchant, msg.sender, amount, fee, netAmount);
    }
    
    /**
     * @notice Admin function to settle multiple merchants in one transaction
     * @dev Called daily by PuffPass backend to distribute USDC to merchants
     * @param merchants Array of merchant addresses
     * @param amounts Array of amounts to settle
     */
    function batchSettle(
        address[] calldata merchants,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        require(merchants.length == amounts.length, "Array length mismatch");
        require(merchants.length > 0, "Empty batch");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < merchants.length; i++) {
            address merchant = merchants[i];
            uint256 amount = amounts[i];
            
            require(merchant != address(0), "Invalid merchant address");
            require(amount > 0, "Amount must be > 0");
            require(merchantVaults[merchant] >= amount, "Insufficient vault balance");
            
            merchantVaults[merchant] -= amount;
            require(usdc.transfer(merchant, amount), "Settlement failed");
            
            totalAmount += amount;
        }
        
        emit BatchSettlement(merchants.length, totalAmount);
    }
    
    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @notice Get merchant's current vault balance
     * @param merchant Merchant address
     * @return Current vault balance
     */
    function getMerchantBalance(address merchant) external view returns (uint256) {
        return merchantVaults[merchant];
    }
    
    /**
     * @notice Emergency function to drain contract (safety only)
     * @dev Should never be needed in normal operation
     */
    function emergencyDrain() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(usdc.transfer(treasury, balance), "Drain failed");
    }
}
