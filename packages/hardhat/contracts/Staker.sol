pragma solidity 0.8.4;

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {

  ExampleExternalContract public exampleExternalContract;
  bool public completed = false;
  mapping ( address => uint256 ) public balances;
  uint256 public constant threshold = 1 ether;
  uint256 public deadline = block.timestamp + 2 days;
  // uint256 public deadline = block.timestamp + 30 seconds;

  event Stake(address sender, uint256 amount);
  event Withdraw(address sender, uint256 amount);

  constructor(address exampleExternalContractAddress) public {
    exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
  }

  modifier beforeDeadline() {
    require(block.timestamp <= deadline, "after deadline");
    _;
  }

  modifier afterDeadline() {
    require(deadline < block.timestamp, "before deadline");
    _;
  }

  modifier hasNotCompleted() {
    require(!completed, "already completed");
    _;
  }

  modifier thresholdMet() {
    require(address(this).balance >= threshold, "staker balance below threshold");
    _;
  }

  modifier senderHasBalance() {
    require(balances[msg.sender] > 0, "zero balance");
    _;
  }

  // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
  //  ( make sure to add a `Stake(address,uint256)` event and emit it for the frontend <List/> display )
  function stake() public payable hasNotCompleted beforeDeadline {
    balances[msg.sender] += msg.value;
    emit Stake(msg.sender, msg.value);
  }

  // After some `deadline` allow anyone to call an `execute()` function
  //  It should either call `exampleExternalContract.complete{value: address(this).balance}()` to send all the value
  function execute() public hasNotCompleted beforeDeadline thresholdMet {
    completed = true;
    exampleExternalContract.complete{value: address(this).balance}();
  }

  // if the `threshold` was not met, allow everyone to call a `withdraw()` function
  function withdraw() public afterDeadline senderHasBalance {
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
    emit Withdraw(msg.sender, amount);
  }

  // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend
  function timeLeft() public view returns (uint256) {
    if (deadline < block.timestamp) return 0;
    return deadline - block.timestamp;
  }

  // Add the `receive()` special function that receives eth and calls stake()
  receive() external payable { stake(); }

}
