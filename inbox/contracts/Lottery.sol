pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(
            msg.value > .01 ether,
            "Min value must be .01 ether."
            );
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty,now,players));
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(this.balance); //send the balance of the current contract
        players = new address[](0); //creates an dynamic array with 0 values in it.
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
    
    modifier restricted() {
        require(
            msg.sender == manager,
            "You're not allow to perform this action."
            );
        _;
    }

}