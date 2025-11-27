// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {DeadMansSwitch} from "../src/DeadManSwitch.sol";
import {TestToken} from "../src/TestToken.sol";

contract DeadManSwitchScript is Script {
    DeadMansSwitch public deadMansSwitch;
    TestToken public testToken;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        testToken = new TestToken();

        deadMansSwitch = new DeadMansSwitch(
            address(testToken),
            msg.sender,
            1 days
        );

        testToken.transfer(address(deadMansSwitch), 50 ether);

        vm.stopBroadcast();
    }
}
