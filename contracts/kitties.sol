pragma solidity ^0.8.4;

contract Owned {
    address payable owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Account is not owner from contract.");
        _;
    }
}

contract Mortal is Owned {
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}

pragma experimental ABIEncoderV2;

contract Kitties is Mortal {
    mapping(uint256 => Kitty) kitties;
    uint256[] kittiesId;
    Kitty[] allKitties;
    Kitty[] newAllKitties;

    struct User {
        address user;
        string name;
    }

    struct Kitty {
        uint256 id;
        string title;
        string description;
        User user;
        uint256 goal;
        uint256 collected;
    }

    event Created(address user, uint256 id, uint256 goal);
    event Donated(address user, uint256 value);

    function getKitty(uint256 id) public view returns (Kitty memory) {
        return kitties[id];
    }

    function getAllKitties() public view returns (Kitty[] memory) {
        return allKitties;
    }

    function createKitty(
        uint256 id,
        string memory title,
        string memory description,
        uint256 goal,
        string memory userName
    ) public {
        require(goal > 0, "Invalid goal");
        require(kitties[id].id != id, "Kitty id is not valid");

        User memory user = User(msg.sender, userName);
        Kitty memory kitty = Kitty(id, title, description, user, goal, 0);

        kitties[id] = kitty;
        kittiesId.push(id);
        allKitties.push(kitty);

        emit Created(msg.sender, id, goal);
    }

    function donate(uint256 id) public payable {
        Kitty memory kitty = kitties[id];

        kitty.collected += msg.value;
        kitties[id] = kitty;

        emit Donated(msg.sender, msg.value);
    }

    function isOwner(uint256 kittyId) public view returns (bool) {
        if (kitties[kittyId].user.user == msg.sender) {
            return true;
        }

        return false;
    }

    function finishKitty(uint256 kittyId) public payable {
        require(kitties[kittyId].user.user == msg.sender, "Just to owner.");

        uint256 value = kitties[kittyId].collected;
        delete kitties[kittyId];

        for (uint256 i = 0; i < allKitties.length; i++) {
            if (allKitties[i].id != kittyId) {
                newAllKitties.push(allKitties[i]);
            }
        }

        allKitties = newAllKitties;
        address payable owner = address(uint160(msg.sender));

        owner.transfer(value);
    }
}
