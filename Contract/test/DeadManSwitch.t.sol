// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DeadMansSwitch} from "../src/DeadManSwitch.sol";

/// @notice Minimal ERC20 mock used for testing
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 private _totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        address initialAccount,
        uint256 initialBalance
    ) {
        name = _name;
        symbol = _symbol;
        _totalSupply = initialBalance;
        balanceOf[initialAccount] = initialBalance;
        emit Transfer(address(0), initialAccount, initialBalance);
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool) {
        require(balanceOf[from] >= value, "insufficient balance");
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= value, "allowance exceeded");
        allowance[from][msg.sender] = allowed - value;
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
}

contract DeadManSwitchTest is Test {
    DeadMansSwitch public deadMansSwitch;
    // Declare events locally so vm.expectEmit can compare them
    event Pinged(address indexed owner, uint256 timestamp);
    event FundsClaimed(address indexed beneficiary, uint256 amount);
    event Deposited(address indexed owner, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);
    address public owner = address(0xABCD);
    address public beneficiary = address(0xBEEF);
    uint256 public timeout = 1 days;
    MockERC20 public token;
    uint256 public initialSupply = 1000 ether;
    uint256 public depositAmount = 1 ether;

    function setUp() public {
        // deploy mock token and give the owner initial supply
        token = new MockERC20("TestToken", "TST", owner, initialSupply);

        // deploy contract as owner (constructor sets owner = msg.sender)
        vm.prank(owner);
        deadMansSwitch = new DeadMansSwitch(
            address(token),
            beneficiary,
            timeout
        );

        // owner approves contract and deposits tokens
        vm.prank(owner);
        token.approve(address(deadMansSwitch), depositAmount);

        vm.prank(owner);
        deadMansSwitch.deposit(depositAmount);
    }

    function testPingUpdatesLastCheckInAndEmits() public {
        // capture last check-in before ping
        uint256 before = deadMansSwitch.lastCheckIn();

        // move forward some time then ping as owner
        vm.warp(before + 100);

        // expect event
        vm.expectEmit(true, false, false, true);
        emit Pinged(owner, block.timestamp);

        vm.prank(owner);
        deadMansSwitch.ping();

        uint256 afterCheck = deadMansSwitch.lastCheckIn();
        assertEq(afterCheck, block.timestamp);
        assertGt(afterCheck, before);
    }

    function testOnlyOwnerCanPing() public {
        vm.prank(address(0xCAFE));
        vm.expectRevert("Only owner can ping");
        deadMansSwitch.ping();
    }

    function testOwnerCanWithdrawBeforeTimeout() public {
        // owner withdraws 0.5 ether before timeout
        uint256 withdrawAmount = 0.5 ether;
        uint256 ownerBalanceBefore = token.balanceOf(owner);

        vm.expectEmit(true, false, false, true);
        emit Withdrawn(owner, withdrawAmount);

        vm.prank(owner);
        deadMansSwitch.withdraw(withdrawAmount);

        assertEq(token.balanceOf(owner), ownerBalanceBefore + withdrawAmount);
    }

    function testBeneficiaryCannotClaimBeforeTimeout() public {
        vm.prank(beneficiary);
        vm.expectRevert("Owner still alive");
        deadMansSwitch.claim();
    }

    function testBeneficiaryCanClaimAfterTimeout() public {
        // advance time past timeout
        uint256 last = deadMansSwitch.lastCheckIn();
        vm.warp(last + timeout + 1);

        uint256 benBefore = token.balanceOf(beneficiary);

        vm.expectEmit(true, false, false, true);
        emit FundsClaimed(beneficiary, depositAmount);

        vm.prank(beneficiary);
        deadMansSwitch.claim();

        // beneficiary should receive the contract token balance (initially depositAmount)
        assertEq(token.balanceOf(beneficiary), benBefore + depositAmount);
    }

    function testOnlyBeneficiaryCanClaim() public {
        // advance time to allow claim
        uint256 last = deadMansSwitch.lastCheckIn();
        vm.warp(last + timeout + 1);

        vm.prank(address(0xDEAD));
        vm.expectRevert("Only beneficiary");
        deadMansSwitch.claim();
    }

    function testOwnerCannotWithdrawAfterTimeout() public {
        // advance time beyond timeout
        uint256 last = deadMansSwitch.lastCheckIn();
        vm.warp(last + timeout + 10);

        vm.prank(owner);
        vm.expectRevert("Timeout passed");
        deadMansSwitch.withdraw(0.1 ether);
    }
}
