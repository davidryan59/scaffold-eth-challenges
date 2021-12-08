import { Card, Button, Col, Divider, Input, Row } from "antd";
import { useBalance, useContractReader } from "eth-hooks";
import { useTokenBalance } from "eth-hooks/erc/erc-20/useTokenBalance";
import { ethers } from "ethers";
import React, { useState } from "react";
import Address from "./Address";
import Contract from "./Contract";
import Curve from "./Curve.jsx";
import TokenBalance from "./TokenBalance";

const contractName = "GameDemo";
const maxEtherDPs = 4;

export default function GameDemo(props) {
  let displayLeft = [];
  let displayMiddle = [];
  let displayRight = [];

  const [form, setForm] = useState({});
  const [values, setValues] = useState({});
  const tx = props.tx;

  const writeContracts = props.writeContracts;

  const contractAddress = props.readContracts[contractName].address;
  const contractBalance = useBalance(props.localProvider, contractAddress);

  const ethBalanceFloat = parseFloat(ethers.utils.formatEther(contractBalance));

  const lastNumber = useContractReader(props.readContracts, contractName, "lastNumber");
  const lastThreshold = useContractReader(props.readContracts, contractName, "lastThreshold");
  const lastLimit = useContractReader(props.readContracts, contractName, "lastLimit");
  const lastStakePlayer = useContractReader(props.readContracts, contractName, "lastStakePlayer");
  const lastStakeHouse = useContractReader(props.readContracts, contractName, "lastStakeHouse");
  const lastValueReturned = useContractReader(props.readContracts, contractName, "lastValueReturned");

  const totalPlays = useContractReader(props.readContracts, contractName, "totalPlays");
  const totalBalance = useContractReader(props.readContracts, contractName, "totalBalance");
  const totalLiquidity = useContractReader(props.readContracts, contractName, "totalLiquidity");
  const liquidity = useContractReader(props.readContracts, contractName, "liquidity", [props.address]);
  const liquidityValue = useContractReader(props.readContracts, contractName, "liquidityValue", [props.address]);

  const rowForm = (title, icon, placeholder, onClick) => {
    return (
      <Row>
        <Col span={8} style={{ textAlign: "right", opacity: 0.333, paddingRight: 6, fontSize: 24 }}>
          {title}
        </Col>
        <Col span={16}>
          <div style={{ cursor: "pointer", margin: 2 }}>
            <Input
              placeholder={placeholder}
              onChange={e => {
                let newValues = { ...values };
                newValues[title] = e.target.value;
                setValues(newValues);
              }}
              value={values[title]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(values[title]);
                    let newValues = { ...values };
                    newValues[title] = "";
                    setValues(newValues);
                  }}
                >
                  {icon}
                </div>
              }
            />
          </div>
        </Col>
      </Row>
    );
  };

  const generalPlayButton = (ethValue, text, num, denom) => (
    <span>
      &nbsp;
      <Button
        onClick={() => {
          tx(writeContracts[contractName]["playGameGeneral"](num, denom, { value: ethers.utils.parseEther("" + ethValue) }));
        }}
      >
        {text}
      </Button>
      &nbsp;
    </span>
  );

  const playButton = (ethValue, fnName) => (
    <span>
      &nbsp;
      <Button
        onClick={() => {
          tx(writeContracts[contractName][fnName]({ value: ethers.utils.parseEther("" + ethValue) }));
        }}
      >
        {"" + ethValue} Ξ
      </Button>
      &nbsp;
    </span>
  );

  const coinFlipButton = ethValue => playButton(ethValue, "playGameCoinFlip1In2");
  const rollDiceButton = ethValue => playButton(ethValue, "playGameDiceRoll1In6");

  const liquiditySymbol = <span style={{ fontStyle: "italic" }}>$LIQ</span>;

  const formatEtherWithTruncation = num => {
    const str = ethers.utils.formatEther(num);
    if (str.includes(".")) {
      const parts = str.split(".");
      return parts[0] + "." + parts[1].slice(0, maxEtherDPs);
    }
    return str;
  };

  if (props.readContracts && props.readContracts[contractName]) {
    displayLeft.push(
      <div>
        {rowForm("deposit", "📥", 'Ether (Ξ)', async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          await tx(writeContracts[contractName]["deposit"]({ value: valueInEther, gasLimit: 200000 }));
        })}
        {/* <Divider>House balance: {totalBalance ? formatEtherWithTruncation(totalBalance) : "none"} Ξ</Divider> */}
        <div>&nbsp;</div>
        <div>My liquidity:&nbsp; {liquidity ? formatEtherWithTruncation(liquidity) : "none"}&nbsp;{liquiditySymbol}&nbsp; ({liquidityValue ? formatEtherWithTruncation(liquidityValue) : "none"}&nbsp;Ξ)</div>
        <div>&nbsp;</div>
        {rowForm("withdraw", "📤", 'Liquidity units ($LIQ)', async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let withdrawTxResult = await tx(writeContracts[contractName]["withdraw"](valueInEther));
          console.log("withdrawTxResult:", withdrawTxResult);
        })}
        <div style={{ padding: 8 }}>
          <Button
            type={"default"}
            onClick={() => {
              tx(writeContracts[contractName]["withdrawAll"]());
            }}
          >
            🏧 Withdraw all my&nbsp;{liquiditySymbol}
          </Button>
        </div>
        <Divider />
        <div>All liquidity:&nbsp; {totalLiquidity ? formatEtherWithTruncation(totalLiquidity) : "none"}&nbsp;{liquiditySymbol}&nbsp; ({totalBalance ? formatEtherWithTruncation(totalBalance) : "none"}&nbsp;Ξ)</div>
        <div>after {totalPlays ? ""+totalPlays : "none"} games played</div>
      </div>,
    );
    const playerWon = lastThreshold <= lastNumber;
    displayRight.push(
      <div>
        <div><b>Game {""+totalPlays}</b></div>
        <div>Threshold {""+lastThreshold}, Limit {""+lastLimit}</div>
        <div>Player stake: {lastStakePlayer ? ethers.utils.formatEther(lastStakePlayer) : "none"} Ξ</div>
        <div>House stake: {lastStakeHouse ? ethers.utils.formatEther(lastStakeHouse) : "none"} Ξ</div>
          <div>Random number was {""+lastNumber}</div>
        <div style={{color: playerWon ? 'green' : 'red'}}>
          <div><b>{playerWon ? 'Player WON, ' + (lastValueReturned ? ethers.utils.formatEther(lastValueReturned) : "none") + ' Ξ was returned' : 'Player lost'}</b></div>
        </div>
      </div>

    );
    displayMiddle.push(
      <div>
        <div>💰 Flip a coin!</div>
        <div style={{ fontStyle: "italic", fontSize: "80%", color: "#888888" }}>1 in 2 chance of winning</div>
        <div style={{ padding: 8 }}>
          {coinFlipButton(0.001)}
          {coinFlipButton(0.01)}
          {coinFlipButton(0.1)}
          {coinFlipButton(1)}
          {coinFlipButton(10)}
        </div>
        <div style={{ padding: 8 }}>
          {coinFlipButton(0.002)}
          {coinFlipButton(0.02)}
          {coinFlipButton(0.2)}
          {coinFlipButton(2)}
          {coinFlipButton(20)}
        </div>
        <div style={{ padding: 8 }}>
          {coinFlipButton(0.005)}
          {coinFlipButton(0.05)}
          {coinFlipButton(0.5)}
          {coinFlipButton(5)}
          {coinFlipButton(50)}
        </div>

        <div>&nbsp;</div>
        <div>🎲 Roll a dice!</div>
        <div style={{ fontStyle: "italic", fontSize: "80%", color: "#888888" }}>1 in 6 chance of winning</div>
        <div style={{ padding: 8 }}>
          {rollDiceButton(0.001)}
          {rollDiceButton(0.01)}
          {rollDiceButton(0.1)}
          {rollDiceButton(1)}
          {rollDiceButton(10)}
        </div>
        <div style={{ padding: 8 }}>
          {rollDiceButton(0.002)}
          {rollDiceButton(0.02)}
          {rollDiceButton(0.2)}
          {rollDiceButton(2)}
          {rollDiceButton(20)}
        </div>
        <div style={{ padding: 8 }}>
          {rollDiceButton(0.005)}
          {rollDiceButton(0.05)}
          {rollDiceButton(0.5)}
          {rollDiceButton(5)}
          {rollDiceButton(50)}
        </div>

        <div>&nbsp;</div>
        <div>☘️ Lucky 7, with 0.777 Ξ</div>
        <div style={{ padding: 8 }}>
          {generalPlayButton(0.777, "3 to 7", 3, 7)}
          {generalPlayButton(0.777, "6 or 7", 6, 7)}
          {generalPlayButton(0.777, "7", 7, 7)}
        </div>

        <div>&nbsp;</div>
        <div>♼ Roulette to 41, with 0.1 Ξ</div>
        <div style={{ padding: 8 }}>
          {generalPlayButton(0.1, "12", 30, 41)}
          {generalPlayButton(0.1, "8", 34, 41)}
          {generalPlayButton(0.1, "6", 36, 41)}
          {generalPlayButton(0.1, "4", 38, 41)}
          {generalPlayButton(0.1, "3", 30, 41)}
          {generalPlayButton(0.1, "2", 40, 41)}
          {generalPlayButton(0.1, "1", 41, 41)}
        </div>

        <div>&nbsp;</div>
        <div style={{color: 'grey'}}>TODO: implement a slider for player stake, log scale from 0.001 to 100</div>
      </div>,
    );
  }
  return (
    <Row span={24}>
      <Col span={8}>
        <Card title={'House liquidity'}>{displayLeft}</Card>
      </Col>
      <Col span={8}>
        <Card title={'Play daring games of chance'}>{displayMiddle}</Card>
      </Col>
      <Col span={8}>
        <Card title={'Stats from last game'}>{displayRight}</Card>
      </Col>
    </Row>
  );

}
