// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeadMansSwitch {
    address public owner;
    address public beneficiary;

    IERC20 public immutable TOKEN;

    uint256 public lastCheckIn;
    uint256 public timeoutPeriod; // in seconds

    event Pinged(address indexed owner, uint256 timestamp);
    event Deposited(address indexed owner, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);
    event FundsClaimed(address indexed beneficiary, uint256 amount);

    constructor(address _token, address _beneficiary, uint256 _timeoutPeriod) {
        require(_token != address(0), "Invalid token");
        require(_beneficiary != address(0), "Invalid beneficiary");

        owner = msg.sender;
        beneficiary = _beneficiary;
        TOKEN = IERC20(_token);
        timeoutPeriod = _timeoutPeriod;

        lastCheckIn = block.timestamp;
    }

    /// @notice Owner must have approved this contract to transfer tokens
    function deposit(uint256 amount) external {
        require(msg.sender == owner, "Only owner can deposit");

        bool success = TOKEN.transferFrom(owner, address(this), amount);
        require(success, "Transfer failed");

        emit Deposited(owner, amount);
    }

    /// @notice Owner resets timer to show they're alive
    function ping() external {
        require(msg.sender == owner, "Only owner can ping");

        lastCheckIn = block.timestamp;
        emit Pinged(owner, lastCheckIn);
    }

    /// @notice Beneficiary claims funds after timeout
    function claim() external {
        require(msg.sender == beneficiary, "Only beneficiary");
        require(
            block.timestamp > lastCheckIn + timeoutPeriod,
            "Owner still alive"
        );

        uint256 balance = TOKEN.balanceOf(address(this));
        require(balance > 0, "No tokens to claim");

        bool success = TOKEN.transfer(beneficiary, balance);
        require(success, "Transfer failed");

        emit FundsClaimed(beneficiary, balance);
    }

    /// @notice Owner can withdraw as long as they are alive
    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        require(
            block.timestamp <= lastCheckIn + timeoutPeriod,
            "Timeout passed"
        );

        bool success = TOKEN.transfer(owner, amount);
        require(success, "Transfer failed");

        emit Withdrawn(owner, amount);
    }

    function getBalance() public view returns (uint) {
        return TOKEN.balanceOf(address(this));
    }
}
