// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IComplianceContract {
    function checkTransactionCompliance(address user, uint256 amount) external view returns (bool, string memory);
    function checkMerchantCompliance(address merchant) external view returns (bool, string memory);
    function recordTransaction(address user, uint256 amount) external;
}

interface IPuffToken {
    function mint(address to, uint256 amount, string calldata reason) external;
}

/**
 * @title MerchantProcessor
 * @notice Processes cannabis transactions with compliance checks and fee distribution
 * @dev Handles payments, fees, and PUFF rewards distribution
 */
contract MerchantProcessor is ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");

    IERC20 public immutable usdcToken;
    IPuffToken public immutable puffToken;
    IComplianceContract public complianceContract;

    // Fee structure
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant INSTANT_WITHDRAWAL_FEE_BPS = 700; // 7%
    uint256 public constant DELAYED_WITHDRAWAL_FEE_BPS = 500; // 5%
    uint256 public constant REWARDS_ALLOCATION_BPS = 1000; // 10% of fees to rewards
    uint256 public constant BASIS_POINTS = 10000;

    // Treasury addresses
    address public platformTreasury;
    address public puffVault;

    // Merchant balances
    mapping(address => uint256) public merchantBalances;
    mapping(address => uint256) public merchantTotalProcessed;
    mapping(address => uint256) public merchantFeesCollected;

    // Transaction tracking
    uint256 public totalTransactions;
    uint256 public totalVolume;
    uint256 public totalFeesCollected;

    // Events
    event PaymentProcessed(
        address indexed customer,
        address indexed merchant,
        uint256 amount,
        uint256 platformFee,
        uint256 merchantNet,
        uint256 puffRewards
    );
    event MerchantWithdrawal(
        address indexed merchant,
        uint256 amount,
        uint256 fee,
        uint256 netAmount,
        bool instant
    );
    event FeesDistributed(uint256 platformAmount, uint256 vaultAmount);

    constructor(
        address _usdcToken,
        address _puffToken,
        address _complianceContract,
        address _platformTreasury,
        address _puffVault
    ) {
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_puffToken != address(0), "Invalid PUFF address");
        require(_complianceContract != address(0), "Invalid compliance address");
        require(_platformTreasury != address(0), "Invalid treasury address");
        require(_puffVault != address(0), "Invalid vault address");

        usdcToken = IERC20(_usdcToken);
        puffToken = IPuffToken(_puffToken);
        complianceContract = IComplianceContract(_complianceContract);
        platformTreasury = _platformTreasury;
        puffVault = _puffVault;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROCESSOR_ROLE, msg.sender);
    }

    /**
     * @notice Process customer payment to merchant
     * @param customer Customer address
     * @param merchant Merchant address
     * @param amount Payment amount in USDC
     */
    function processPayment(
        address customer,
        address merchant,
        uint256 amount
    ) external onlyRole(PROCESSOR_ROLE) nonReentrant whenNotPaused {
        require(customer != address(0), "Invalid customer");
        require(merchant != address(0), "Invalid merchant");
        require(amount > 0, "Amount must be greater than 0");

        // Compliance checks
        (bool customerCompliant, string memory customerReason) = complianceContract.checkTransactionCompliance(customer, amount);
        require(customerCompliant, customerReason);

        (bool merchantCompliant, string memory merchantReason) = complianceContract.checkMerchantCompliance(merchant);
        require(merchantCompliant, merchantReason);

        // Calculate fees and amounts
        uint256 platformFee = (amount * PLATFORM_FEE_BPS) / BASIS_POINTS;
        uint256 merchantNet = amount - platformFee;

        // Transfer USDC from customer
        usdcToken.safeTransferFrom(customer, address(this), amount);

        // Credit merchant balance
        merchantBalances[merchant] += merchantNet;
        merchantTotalProcessed[merchant] += amount;
        merchantFeesCollected[merchant] += platformFee;

        // Distribute platform fee
        uint256 vaultAllocation = (platformFee * REWARDS_ALLOCATION_BPS) / BASIS_POINTS;
        uint256 treasuryAllocation = platformFee - vaultAllocation;

        usdcToken.safeTransfer(platformTreasury, treasuryAllocation);
        usdcToken.safeTransfer(puffVault, vaultAllocation);

        // Mint PUFF rewards (1 PUFF per $1 spent)
        uint256 puffRewards = amount / 10**6; // USDC has 6 decimals, PUFF has 18
        puffToken.mint(customer, puffRewards * 10**18, "Purchase reward");

        // Update tracking
        totalTransactions++;
        totalVolume += amount;
        totalFeesCollected += platformFee;

        // Record in compliance contract
        complianceContract.recordTransaction(customer, amount);

        emit PaymentProcessed(customer, merchant, amount, platformFee, merchantNet, puffRewards);
        emit FeesDistributed(treasuryAllocation, vaultAllocation);
    }

    /**
     * @notice Merchant withdraws funds (instant with 7% fee or delayed with 5% fee)
     * @param amount Amount to withdraw
     * @param instant Whether to use instant withdrawal
     */
    function merchantWithdraw(uint256 amount, bool instant) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(merchantBalances[msg.sender] >= amount, "Insufficient balance");

        // Calculate withdrawal fee
        uint256 feeBps = instant ? INSTANT_WITHDRAWAL_FEE_BPS : DELAYED_WITHDRAWAL_FEE_BPS;
        uint256 fee = (amount * feeBps) / BASIS_POINTS;
        uint256 netAmount = amount - fee;

        // Deduct from merchant balance
        merchantBalances[msg.sender] -= amount;

        // Distribute fee (10% to vault, rest to treasury)
        uint256 vaultAllocation = (fee * REWARDS_ALLOCATION_BPS) / BASIS_POINTS;
        uint256 treasuryAllocation = fee - vaultAllocation;

        // Transfer funds
        usdcToken.safeTransfer(msg.sender, netAmount);
        usdcToken.safeTransfer(platformTreasury, treasuryAllocation);
        usdcToken.safeTransfer(puffVault, vaultAllocation);

        emit MerchantWithdrawal(msg.sender, amount, fee, netAmount, instant);
        emit FeesDistributed(treasuryAllocation, vaultAllocation);
    }

    /**
     * @notice Get merchant balance
     * @param merchant Merchant address
     */
    function getMerchantBalance(address merchant) external view returns (uint256) {
        return merchantBalances[merchant];
    }

    /**
     * @notice Update compliance contract address
     * @param newComplianceContract New compliance contract address
     */
    function updateComplianceContract(address newComplianceContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newComplianceContract != address(0), "Invalid address");
        complianceContract = IComplianceContract(newComplianceContract);
    }

    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "Invalid address");
        platformTreasury = newTreasury;
    }

    /**
     * @notice Update vault address
     * @param newVault New vault address
     */
    function updateVault(address newVault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newVault != address(0), "Invalid address");
        puffVault = newVault;
    }

    /**
     * @notice Pause processing (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause processing
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
