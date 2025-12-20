// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Upload {
    struct Access {
        address user;
        bool access;
    }

    mapping(address => string[]) value;
    mapping(address => Access[]) accessList;
    mapping(address => mapping(address => bool)) ownerShip;
    mapping(address => mapping(address => bool)) previousData;

    //add image url
    function add(address _user, string memory url) external {
        value[_user].push(url);
    }

    //allow function
    function allow(address user) external {
        ownerShip[msg.sender][user] = true;
        if (previousData[msg.sender][user]) {
            for (uint i = 0; i < accessList[msg.sender].length; i++) {
                if (accessList[msg.sender][i].user == user) {
                    accessList[msg.sender][i].access = true;
                    break;
                }
            }
        } else {
            accessList[msg.sender].push(Access(user, true));
            previousData[msg.sender][user] = true;
        }
    }

    function disAllow(address user) external {
        ownerShip[msg.sender][user] = false;
        for (uint i = 0; i < accessList[msg.sender].length; i++) {
            if (accessList[msg.sender][i].user == user) {
                accessList[msg.sender][i].access = false;
                break;
            }
        }
    }

    function display(address _user) external view returns (string[] memory) {
        require(
            _user == msg.sender || ownerShip[_user][msg.sender],
            "You don't have access"
        );
        return value[_user];
    }

    function shareAccess() public view returns (Access[] memory) {
        return accessList[msg.sender];
    }
}
