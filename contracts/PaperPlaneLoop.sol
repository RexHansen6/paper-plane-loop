// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaperPlaneLoop {
    mapping(address => uint256) public userFolds;
    mapping(address => uint256) public userLaunches;
    mapping(address => uint256) public userLandings;

    uint256 public totalFolds;
    uint256 public totalLaunches;
    uint256 public totalLandings;

    event PlaneFolded(address indexed user, uint256 userFolds, uint256 totalFolds);
    event PlaneLaunched(address indexed user, uint256 userLaunches, uint256 totalLaunches);
    event PlaneLanded(address indexed user, uint256 userLandings, uint256 totalLandings);

    function foldPlane() external {
        unchecked {
            userFolds[msg.sender] += 1;
            totalFolds += 1;
        }

        emit PlaneFolded(msg.sender, userFolds[msg.sender], totalFolds);
    }

    function launchPlane() external {
        unchecked {
            userLaunches[msg.sender] += 1;
            totalLaunches += 1;
        }

        emit PlaneLaunched(msg.sender, userLaunches[msg.sender], totalLaunches);
    }

    function landPlane() external {
        unchecked {
            userLandings[msg.sender] += 1;
            totalLandings += 1;
        }

        emit PlaneLanded(msg.sender, userLandings[msg.sender], totalLandings);
    }
}

