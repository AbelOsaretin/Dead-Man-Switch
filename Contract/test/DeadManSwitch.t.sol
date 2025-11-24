// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DeadMansSwitch} from "../src/DeadManSwitch.sol";

contract DeadManSwitchTest is Test {
    DeadMansSwitch public deadMansSwitch;
    // Declare events locally so vm.expectEmit can compare them
    event Pinged(address indexed owner, uint256 timestamp);
    event FundsClaimed(address indexed beneficiary, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);
    address public owner = address(0xABCD);
    address public beneficiary = address(0xBEEF);
    uint256 public timeout = 1 days;

    function setUp() public {
        // give the owner some ETH to deploy and fund the contract
        vm.deal(owner, 5 ether);

        // deploy contract as owner and fund with 1 ether
        vm.prank(owner);
        deadMansSwitch = new DeadMansSwitch{value: 1 ether}(
            beneficiary,
            timeout
        );
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
        uint256 ownerBalanceBefore = owner.balance;

        vm.expectEmit(true, false, false, true);
        emit Withdrawn(owner, withdrawAmount);

        vm.prank(owner);
        deadMansSwitch.withdraw(withdrawAmount);

        assertEq(owner.balance, ownerBalanceBefore + withdrawAmount);
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

        uint256 benBefore = beneficiary.balance;

        vm.expectEmit(true, false, false, true);
        emit FundsClaimed(beneficiary, 1 ether);

        vm.prank(beneficiary);
        deadMansSwitch.claim();

        // beneficiary should receive the contract balance (initially 1 ether)
        assertEq(beneficiary.balance, benBefore + 1 ether);
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
