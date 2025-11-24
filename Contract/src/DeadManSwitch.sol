// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DeadMansSwitch {
    address public owner;
    address public beneficiary;

    uint256 public lastCheckIn;
    uint256 public timeoutPeriod; // in seconds

    event Pinged(address indexed owner, uint256 timestamp);
    event FundsClaimed(address indexed beneficiary, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(address _beneficiary, uint256 _timeoutPeriod) payable {
        require(_beneficiary != address(0), "Invalid beneficiary");

        owner = msg.sender;
        beneficiary = _beneficiary;
        timeoutPeriod = _timeoutPeriod;

        lastCheckIn = block.timestamp; // initialize on deployment
    }

    /// @notice Owner confirms they're still alive.
    function ping() external {
        require(msg.sender == owner, "Only owner can ping");
        lastCheckIn = block.timestamp;

        emit Pinged(owner, lastCheckIn);
    }

    /// @notice Beneficiary claims funds if timeout has passed.
    function claim() external {
        require(msg.sender == beneficiary, "Only beneficiary");
        require(
            block.timestamp > lastCheckIn + timeoutPeriod,
            "Owner still alive"
        );

        uint256 amount = address(this).balance;
        require(amount > 0, "No funds to claim");

        (bool success, ) = beneficiary.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsClaimed(beneficiary, amount);
    }

    /// @notice Owner can withdraw funds anytime while alive.
    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(
            block.timestamp <= lastCheckIn + timeoutPeriod,
            "Timeout passed"
        );

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdraw failed");

        emit Withdrawn(owner, amount);
    }

    /// @notice Allow additional deposits
    receive() external payable {}
}
