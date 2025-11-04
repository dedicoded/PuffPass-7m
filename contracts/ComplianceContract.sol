// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ComplianceContract
 * @notice Manages regulatory compliance for cannabis transactions
 * @dev Handles age verification, merchant licensing, and transaction limits
 */
contract ComplianceContract is AccessControl, Pausable {
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Age verification
    struct AgeVerification {
        bool verified;
        uint256 verifiedAt;
        uint256 expiresAt;
        string verificationMethod; // "ID", "Biometric", "ThirdParty"
    }

    // Merchant licensing
    struct MerchantLicense {
        bool active;
        string licenseNumber;
        uint256 issuedAt;
        uint256 expiresAt;
        string jurisdiction;
        uint256 dailyLimit;
        uint256 monthlyLimit;
    }

    // User compliance status
    struct UserCompliance {
        bool kycCompleted;
        uint8 kycLevel; // 0=None, 1=Basic, 2=Enhanced, 3=Full
        uint256 kycCompletedAt;
        bool sanctionsChecked;
        uint256 lastSanctionsCheck;
    }

    // Mappings
    mapping(address => AgeVerification) public ageVerifications;
    mapping(address => MerchantLicense) public merchantLicenses;
    mapping(address => UserCompliance) public userCompliance;
    mapping(address => mapping(uint256 => uint256)) public dailySpending; // user => day => amount
    mapping(address => mapping(uint256 => uint256)) public monthlySpending; // user => month => amount

    // Limits
    uint256 public constant MAX_DAILY_LIMIT = 5000 * 10**6; // $5,000 USDC
    uint256 public constant MAX_MONTHLY_LIMIT = 50000 * 10**6; // $50,000 USDC
    uint256 public constant AGE_VERIFICATION_VALIDITY = 365 days;

    // Events
    event AgeVerified(address indexed user, string method, uint256 expiresAt);
    event MerchantLicenseIssued(address indexed merchant, string licenseNumber, string jurisdiction);
    event MerchantLicenseRevoked(address indexed merchant, string reason);
    event KYCCompleted(address indexed user, uint8 level);
    event ComplianceViolation(address indexed user, string violationType, string details);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Verify user's age
     * @param user User address
     * @param method Verification method used
     */
    function verifyAge(address user, string calldata method) external onlyRole(VERIFIER_ROLE) {
        require(user != address(0), "Invalid user address");

        uint256 expiresAt = block.timestamp + AGE_VERIFICATION_VALIDITY;

        ageVerifications[user] = AgeVerification({
            verified: true,
            verifiedAt: block.timestamp,
            expiresAt: expiresAt,
            verificationMethod: method
        });

        emit AgeVerified(user, method, expiresAt);
    }

    /**
     * @notice Issue merchant license
     * @param merchant Merchant address
     * @param licenseNumber License number
     * @param jurisdiction Jurisdiction (state/country)
     * @param validityPeriod Validity period in seconds
     * @param dailyLimit Daily transaction limit
     * @param monthlyLimit Monthly transaction limit
     */
    function issueMerchantLicense(
        address merchant,
        string calldata licenseNumber,
        string calldata jurisdiction,
        uint256 validityPeriod,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        require(merchant != address(0), "Invalid merchant address");
        require(bytes(licenseNumber).length > 0, "License number required");
        require(dailyLimit <= MAX_DAILY_LIMIT, "Daily limit exceeds maximum");
        require(monthlyLimit <= MAX_MONTHLY_LIMIT, "Monthly limit exceeds maximum");

        merchantLicenses[merchant] = MerchantLicense({
            active: true,
            licenseNumber: licenseNumber,
            issuedAt: block.timestamp,
            expiresAt: block.timestamp + validityPeriod,
            jurisdiction: jurisdiction,
            dailyLimit: dailyLimit,
            monthlyLimit: monthlyLimit
        });

        emit MerchantLicenseIssued(merchant, licenseNumber, jurisdiction);
    }

    /**
     * @notice Revoke merchant license
     * @param merchant Merchant address
     * @param reason Reason for revocation
     */
    function revokeMerchantLicense(address merchant, string calldata reason) 
        external 
        onlyRole(COMPLIANCE_OFFICER_ROLE) 
    {
        require(merchantLicenses[merchant].active, "License not active");
        
        merchantLicenses[merchant].active = false;
        
        emit MerchantLicenseRevoked(merchant, reason);
    }

    /**
     * @notice Complete KYC for user
     * @param user User address
     * @param level KYC level (1=Basic, 2=Enhanced, 3=Full)
     */
    function completeKYC(address user, uint8 level) external onlyRole(VERIFIER_ROLE) {
        require(user != address(0), "Invalid user address");
        require(level >= 1 && level <= 3, "Invalid KYC level");

        userCompliance[user].kycCompleted = true;
        userCompliance[user].kycLevel = level;
        userCompliance[user].kycCompletedAt = block.timestamp;

        emit KYCCompleted(user, level);
    }

    /**
     * @notice Check if user is compliant for transaction
     * @param user User address
     * @param amount Transaction amount
     * @return compliant Whether user is compliant
     * @return reason Reason if not compliant
     */
    function checkTransactionCompliance(address user, uint256 amount) 
        external 
        view 
        returns (bool compliant, string memory reason) 
    {
        // Check age verification
        if (!ageVerifications[user].verified) {
            return (false, "Age not verified");
        }
        if (block.timestamp > ageVerifications[user].expiresAt) {
            return (false, "Age verification expired");
        }

        // Check KYC
        if (!userCompliance[user].kycCompleted) {
            return (false, "KYC not completed");
        }

        // Check daily limit
        uint256 today = block.timestamp / 1 days;
        if (dailySpending[user][today] + amount > MAX_DAILY_LIMIT) {
            return (false, "Daily limit exceeded");
        }

        // Check monthly limit
        uint256 thisMonth = block.timestamp / 30 days;
        if (monthlySpending[user][thisMonth] + amount > MAX_MONTHLY_LIMIT) {
            return (false, "Monthly limit exceeded");
        }

        return (true, "");
    }

    /**
     * @notice Check if merchant is compliant
     * @param merchant Merchant address
     * @return compliant Whether merchant is compliant
     * @return reason Reason if not compliant
     */
    function checkMerchantCompliance(address merchant) 
        external 
        view 
        returns (bool compliant, string memory reason) 
    {
        MerchantLicense memory license = merchantLicenses[merchant];

        if (!license.active) {
            return (false, "License not active");
        }
        if (block.timestamp > license.expiresAt) {
            return (false, "License expired");
        }

        return (true, "");
    }

    /**
     * @notice Record transaction for compliance tracking
     * @param user User address
     * @param amount Transaction amount
     */
    function recordTransaction(address user, uint256 amount) external onlyRole(VERIFIER_ROLE) {
        uint256 today = block.timestamp / 1 days;
        uint256 thisMonth = block.timestamp / 30 days;

        dailySpending[user][today] += amount;
        monthlySpending[user][thisMonth] += amount;
    }

    /**
     * @notice Pause compliance checks (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause compliance checks
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
