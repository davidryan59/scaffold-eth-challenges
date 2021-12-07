pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {

  // Most important variables
  uint256 public nonce;
  uint256 public totalBalance; // tracks money in contract
  uint256 public totalLiquidity; // tracks total liquidity deposited. Only at start, money units = liquidity units
  mapping (address => uint256) public liquidity;

  // House edge is houseEdgeNumerator/houseEdgeDenominator
  uint256 public houseEdgeNumerator;
  uint256 public houseEdgeDenominator;

  // Aggregate statistics
  uint256 public totalPlays;
  uint256 public totalStakePlayer;
  uint256 public totalStakeHouse;
  uint256 public totalValueReturned;

  // Statistics from last game
  uint256 public playStakePlayer;
  uint256 public playStakeHouse;
  uint256 public playValueReturned;

  constructor() {
    // In this setup, 3/100 = 3% house edge, so house returns around $97 on every $100 played
    houseEdgeNumerator = 3;
    houseEdgeDenominator = 100;
  }

  function deposit() public payable returns (uint256) {
    uint256 ethDeposit = msg.value;
    require(ethDeposit > 0, "No funds deposited");
    uint256 liqDeposit = totalBalance == 0 ? ethDeposit : (ethDeposit * totalLiquidity) / totalBalance;
    // After initial deposit, should not let totalBalance go back to zero unless liquidity also goes back to zero
    // (L'Hôpital's rule applied to formula for liqDeposit)
    // This is ensured by not allowing more than ~10% of house money to be staked on any individual game (*)
    totalBalance += ethDeposit;
    totalLiquidity += liqDeposit;
    liquidity[msg.sender] += liqDeposit;
    return liqDeposit;
  }

  function withdraw(uint256 liqWithdraw) public returns (uint256) {
    require(0 < liqWithdraw, "Cannot withdraw zero liquidity");
    require(liqWithdraw <= liquidity[msg.sender], "User has insufficient liquidity");
    uint256 ethWithdraw = (liqWithdraw * totalBalance) / totalLiquidity;
    totalBalance -= ethWithdraw;
    totalLiquidity -= liqWithdraw;
    liquidity[msg.sender] -= liqWithdraw;
    (bool sent, ) = msg.sender.call{value: ethWithdraw}("");
    require(sent, "Failed to send user eth");
    return ethWithdraw;
  }

  function withdrawAll() public returns (uint256) {
    return withdraw(liquidity[msg.sender]);
  }

  // More reliable alternative would be using Chainlink VRF
  function getRandom(uint256 limit) public returns (uint256) {
    uint256 bh = uint(blockhash(block.number - 1));
    uint256 bt = block.timestamp;
    uint256 res = uint(keccak256(abi.encodePacked(bh, bt, nonce)));
    nonce += 1;
    return res % limit;
  }

  function playGameCoinFlip1In2() public payable {
    playGameGeneral(1, 2);
  }

  function playGameDiceRoll1In6() public payable {
    playGameGeneral(1, 6);
  }

  function playGameGeneral(uint256 winNumerator, uint256 winDenominator) public payable {
    totalPlays += 1;
    playValueReturned = 0;
    require(0 < totalBalance, "Liquidity must be deposited before play can commence");
    require(0 < winNumerator, "winNumerator must be greater than 0");
    require(winNumerator < winDenominator, "winNumerator must be less than winDenominator");
    playStakePlayer = msg.value;
    totalStakePlayer += playStakePlayer;
    totalBalance += playStakePlayer; // payable function, so player has already deposited
    require(0 < playStakePlayer, "Put some money in, you cheapskate!");
    // playStakeHouse = (playStakePlayer * 99 * (winDenominator - winNumerator)) / (100 * winNumerator); $99 of $100 returned
    playStakeHouse = (playStakePlayer * (houseEdgeDenominator - houseEdgeNumerator) * (winDenominator - winNumerator)) / (houseEdgeDenominator * winNumerator);

    totalStakeHouse += playStakeHouse;
    require(playStakeHouse * 9 <= totalBalance, "playStakeHouse exceeds 10% of totalBalance"); // (*)
    uint256 randomInteger = getRandom(winDenominator);
    if (randomInteger < winNumerator) {
      // Player wins! :D
      playValueReturned = playStakePlayer + playStakeHouse;
      totalBalance -= playValueReturned;
      totalValueReturned += playValueReturned;
      (bool sent, ) = msg.sender.call{value: playValueReturned}("");
      require(sent, "Failed to send user winnings - good for the house short term, less good for long term reputation...");
    } else {
      // Player loses :( no further action needed (yet)
    }
  }  
}