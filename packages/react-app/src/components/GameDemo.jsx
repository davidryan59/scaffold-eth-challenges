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
  const playStakePlayer = useContractReader(props.readContracts, contractName, "playStakePlayer");
  const playStakeHouse = useContractReader(props.readContracts, contractName, "playStakeHouse");
  const playValueReturned = useContractReader(props.readContracts, contractName, "playValueReturned");

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
    displayRight.push(
      <div>
        <Divider style={{color: lastLimit-lastNumber < lastLimit-(lastThreshold-1) ? 'red' : 'green'}}>
          Game {""+totalPlays}: result was {""+(lastLimit-lastNumber)} with threshold {""+(lastLimit-(lastThreshold-1))} and limit {""+lastLimit}
        </Divider>
        <Divider>Player staked: {playStakePlayer ? ethers.utils.formatEther(playStakePlayer) : "none"} Ξ</Divider>
        <Divider>House staked: {playStakeHouse ? ethers.utils.formatEther(playStakeHouse) : "none"} Ξ</Divider>
        <Divider>Returned to player: {playValueReturned ? ethers.utils.formatEther(playValueReturned) : "none"} Ξ</Divider>

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

        {/* <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div>♼ Spin a roulette wheel!</div>
        <div style={{ padding: 8 }}>
          {rollDiceButton(0.001)}
          {rollDiceButton(0.01)}
          {rollDiceButton(0.1)}
          {rollDiceButton(1)}
          {rollDiceButton(10)}
        </div> */}

      </div>
    );
  }
  return (
    <Row span={24}>
      <Col span={7}>
        <Card title={'House liquidity'}>{displayLeft}</Card>
      </Col>
      <Col span={10}>
        <Card title={'Play daring games of chance'}>{displayMiddle}</Card>
      </Col>
      <Col span={7}>
        <Card title={'Stats from last game'}>{displayRight}</Card>
      </Col>
    </Row>
  );

}
