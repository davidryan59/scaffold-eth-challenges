pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GameDemo {

  // Nonce should be private, it is used to help generate randomness based on past behaviour
  uint256 private nonce;
  uint256[] private nonceIncrements = [31054527504, 22181805360, 17252515280, 14115694320, 11944049040, 9704539845, 9133684560, 8172244080, 6750984240, 5354228880];

  // Most important variables to keep track of Eth balance and liquidity balances
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
  uint256 public lastNumber;
  uint256 public lastThreshold;
  uint256 public lastLimit;
  uint256 public lastStakePlayer;
  uint256 public lastStakeHouse;
  uint256 public lastValueReturned;

  constructor() {
    // In this setup, 3/100 = 3% house edge, so house returns around $97 on every $100 played
    houseEdgeNumerator = 3;
    houseEdgeDenominator = 100;
    incrementNonce(1);
  }

  function liquidityValue(address addr) public view returns (uint256) {
    if (totalLiquidity == 0) {
      return 0;
    }
    return liquidity[addr] * totalBalance / totalLiquidity;
  }

  function incrementNonce(uint256 index) private {
    nonce += nonceIncrements[index % nonceIncrements.length];
  }

  function deposit() public payable returns (uint256) {
    incrementNonce(2);
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
    incrementNonce(3);
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
    incrementNonce(4);
    return withdraw(liquidity[msg.sender]);
  }

  // More reliable alternative would be using Chainlink VRF
  function getRandom(uint256 threshold, uint256 limit) public returns (uint256) {
    incrementNonce(5);
    uint256 bh = uint(blockhash(block.number - 1));
    uint256 bt = block.timestamp;
    uint256 res = 1 + uint(keccak256(abi.encodePacked(bh, bt, nonce)));
    lastNumber = 1 + (res % limit); // between 1 and limit
    lastThreshold = threshold;
    lastLimit = limit;
    return lastNumber;
  }

  function playGameCoinFlip1In2() public payable {
    incrementNonce(6);
    playGameGeneral(2, 2);
  }

  function playGameDiceRoll1In6() public payable {
    incrementNonce(7);
    playGameGeneral(6, 6);
  }

  // Game is to generate a random number in range 1..limit
  // Player wins if number is in range threshold..limit
  // House wins if number is in range 1..(threshold-1)
  function playGameGeneral(uint256 threshold, uint256 limit) public payable {
    incrementNonce(8);
    totalPlays += 1;
    lastValueReturned = 0;
    require(0 < totalBalance, "Liquidity must be deposited before play can commence");
    require(0 < threshold, "Threshold must be greater than 0");
    require(threshold <= limit, "Threshold cannot be greater than limit");
    lastStakePlayer = msg.value;
    totalStakePlayer += lastStakePlayer;
    totalBalance += lastStakePlayer; // payable function, so player has already deposited
    require(0 < lastStakePlayer, "Put some money in, you cheapskate!");
    uint256 widthPlayerWin = limit - (threshold - 1);
    uint256 widthHouseWin = limit - widthPlayerWin;
    lastStakeHouse = (lastStakePlayer * (houseEdgeDenominator - houseEdgeNumerator) * widthHouseWin) / (houseEdgeDenominator * widthPlayerWin);
    totalStakeHouse += lastStakeHouse;
    require(lastStakeHouse * 9 <= totalBalance, "lastStakeHouse exceeds 10% of totalBalance"); // (*)
    uint256 randomInteger = getRandom(threshold, limit);
    if (threshold <= randomInteger) {
      // Player wins! :D
      incrementNonce(9);
      lastValueReturned = lastStakePlayer + lastStakeHouse;
      totalBalance -= lastValueReturned;
      totalValueReturned += lastValueReturned;
      (bool sent, ) = msg.sender.call{value: lastValueReturned}("");
      require(sent, "Failed to send user winnings - good for the house short term, less good for long term reputation...");
    } else {
      // Player loses :(
      incrementNonce(10);
    }
  }  
}