import { Card, Button, Col, Divider, Input, Row, Slider } from "antd";
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

const ethValues = [
  0.001, 0.0012, 0.0015, 0.002, 0.0025, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008,
  0.01, 0.012, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08,
  0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
  1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8,
  10, 12, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100,
];
const defaultEthIdx = 11; // 0.01 $ETH in above list

export default function GameDemo(props) {
  let displayLeft = [];
  let displayMiddle = [];
  let displayRight = [];

  const [form, setForm] = useState({});
  const [values, setValues] = useState({});
  const [ethIdx, setEthIdx] = useState(defaultEthIdx);
  const getEthValue = () => ethValues[ethIdx];
  const getEthText = () => "" + getEthValue() + " Ξ";

  // Inner column widths (summing to 24) for main game area
  const c1 = 10;
  const c2 = 14;

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
  const playerWon = lastThreshold <= lastNumber;
  if (props.readContracts && props.readContracts[contractName]) {
    displayLeft.push(
      <div>
        {rowForm("deposit", "📥", 'Ether (Ξ)', async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          await tx(writeContracts[contractName]["deposit"]({ value: valueInEther, gasLimit: 200000 }));
        })}
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
        <div>{totalPlays ? "after " + totalPlays + " game" + (totalPlays == 1 ? "" : "s") + " played" : ""}</div>
      </div>,
    );
    // const playerWon = lastThreshold <= lastNumber;
    if (totalPlays > 0) {
      displayRight.push(
        <div>
          <div><b>Game {""+totalPlays}</b></div>
          <div>Threshold {""+lastThreshold}, Limit {""+lastLimit}</div>
          <div>Player stake: {lastStakePlayer ? formatEtherWithTruncation(lastStakePlayer) : "none"} Ξ</div>
          <div>House stake: {lastStakeHouse ? formatEtherWithTruncation(lastStakeHouse) : "none"} Ξ</div>
          <div style={{color: playerWon ? '#AAEEAA' : '#EEAAAA'}}>Random number was {""+lastNumber}</div>
          <div style={{color: playerWon ? '#55FF55' : '#FF5555'}}>
            <div><b>{playerWon ? 'Player WON! ' + (lastValueReturned ? formatEtherWithTruncation(lastValueReturned) : "none") + ' Ξ returned' : 'Player lost'}</b></div>
          </div>
        </div>,
      );
    } else {
      displayRight.push(<div>No games have been played yet</div>,)
    }
    displayMiddle.push(
      <div>
        <div style={{padding: 10, background: "#000044", borderRadius: 20, border: "1px solid #002266"}}>
          <div>Set player stake: {getEthText()}</div>
          <Row>
            <Col span={4}>&nbsp;&nbsp;＄</Col>
            <Col span={16}>
              <Slider
                tipFormatter={idx => getEthText()}
                min={0}
                max={ethValues.length - 1}
                defaultValue={ethIdx}
                onChange={idx => setEthIdx(idx)}
              />
            </Col>
            <Col span={4}>
              ＄ ＄ ＄
            </Col>
          </Row>

        </div>
        <div>&nbsp;</div>
        <Row>
          <Col span={c1}>
            <div>💰 Flip a coin!</div>
            <div style={{ fontStyle: "italic", fontSize: "80%", color: "#888888" }}>Win rate: 1 in 2</div>
          </Col>
          <Col span={c2}>
            <div style={{ padding: 4 }}>{coinFlipButton(getEthValue())}</div>
          </Col>
        </Row>
        <div>&nbsp;</div>
        <Row>
          <Col span={c1}>
            <div>🎲 Roll a dice!</div>
            <div style={{ fontStyle: "italic", fontSize: "80%", color: "#888888" }}>Win rate: 1 in 6</div>
          </Col>
          <Col span={c2}>
            <div style={{ padding: 4 }}>{rollDiceButton(getEthValue())}</div>
          </Col>
        </Row>
        <div>&nbsp;</div>
        <Row>
          <Col span={c1}>
            <div>☘️ Lucky 7 with {getEthText()}</div>
            <div style={{ fontStyle: "italic", fontSize: "80%", color: "#888888" }}>Win rate: 5, 2, 1 in 7</div>
          </Col>
          <Col span={c2}>
            <div style={{ padding: 4 }}>
              {generalPlayButton(getEthValue(), "3 to 7", 3, 7)}
              {generalPlayButton(getEthValue(), "6 or 7", 6, 7)}
              {generalPlayButton(getEthValue(), "☘️ 7", 7, 7)}
            </div>
          </Col>
        </Row>
        <div>&nbsp;</div>
        <Row>
          <Col span={c1}>
            <div>&nbsp;</div>
            <div>♼ Roulette with {getEthText()}</div>
            <div style={{ fontStyle: "italic", fontSize: "80%", color: "#888888" }}>Win rate: N in 37</div>
          </Col>
          <Col span={c2}>
            <div style={{ padding: 4 }}>
              {generalPlayButton(getEthValue(), "18", 20, 37)}
              {generalPlayButton(getEthValue(), "8", 30, 37)}
              {generalPlayButton(getEthValue(), "4", 34, 37)}
              {generalPlayButton(getEthValue(), "2", 36, 37)}
            </div>
            <div style={{ padding: 4 }}>
              {generalPlayButton(getEthValue(), "12", 26, 37)}
              {generalPlayButton(getEthValue(), "6", 32, 37)}
              {generalPlayButton(getEthValue(), "3", 35, 37)}
              {generalPlayButton(getEthValue(), "1", 37, 37)}
            </div>
          </Col>
        </Row>
      </div>,
    );
  }
  return (
    <Row style={{ padding: 4 }} span={24}>
      <Col span={8}>
        <Card
          style={{
            margin: 4,
            borderRadius: 10,
            background: "#181818"
          }}
          title={"House liquidity"}
        >
          {displayLeft}
        </Card>
      </Col>
      <Col span={10}>
        <Card
          style={{
            margin: 4,
            borderRadius: 10,
            background: "#181818"
          }}
          title={"Play games of chance with testnet $ETH (Ξ)"}
        >
          {displayMiddle}
        </Card>
      </Col>
      <Col span={6}>
        <Card
          style={{
            margin: 4,
            borderRadius: 10,
            background: totalPlays > 0 ? (playerWon ? "#004400" : "#440000") : "#181818"
          }}
          title={"Stats from last game"}
        >
          {displayRight}
        </Card>
      </Col>
    </Row>
  );

}
