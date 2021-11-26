pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {

  YourToken yourToken;
  uint256 public constant tokensPerEth = 100;

  event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

  constructor(address tokenAddress) public {
    yourToken = YourToken(tokenAddress);
  }

  // ToDo: create a payable buyTokens() function:
  function buyTokens() public payable {
    uint tokensToBuy = msg.value * tokensPerEth;
    require(tokensToBuy <= yourToken.balanceOf(address(this)), "Vendor does not have enough tokens");
    yourToken.transfer(msg.sender, tokensToBuy);
    emit BuyTokens(msg.sender, msg.value, tokensToBuy);
  }

  // ToDo: create a withdraw() function that lets the owner withdraw ETH
  function withdraw() public onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }
  

  // ToDo: create a sellTokens() function:
  

}
