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

contract Kitties is Mortal {
    
    mapping(uint => Kitty) kitties;
    
    struct User {
        address user;
        string name;
    }
    
    struct Kitty {
        uint id;
        User user;
        uint goal;
        uint collected;
    }
    
    event Donated(address user, uint value);
    
    function createKitty(uint id, uint goal, string memory userName) public {
        require(goal > 0, "Invalid goal");
        require(kitties[id].id != id, "Kitty id is not valid");
        
        User memory user = User(msg.sender, userName);
        kitties[id] = Kitty(id, user, goal, 0);
    }
    
    function donate(uint id) public payable {
        Kitty memory kitty = kitties[id];
        
        kitty.collected += msg.value;
        kitties[id] = kitty;
        
        emit Donated(msg.sender, msg.value);
    }
}