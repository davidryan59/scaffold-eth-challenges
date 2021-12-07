import { Card, Col, Divider, Input, Row } from "antd";
import { useBalance, useContractReader } from "eth-hooks";
import { useTokenBalance } from "eth-hooks/erc/erc-20/useTokenBalance";
import { ethers } from "ethers";
import React, { useState } from "react";
import Address from "./Address";
import Contract from "./Contract";
import Curve from "./Curve.jsx";
import TokenBalance from "./TokenBalance";

const contractName = "GameDemo";

export default function GameDemo(props) {
  let display = [];

  const [form, setForm] = useState({});
  const [values, setValues] = useState({});
  const tx = props.tx;

  const writeContracts = props.writeContracts;

  const contractAddress = props.readContracts[contractName].address;
  const contractBalance = useBalance(props.localProvider, contractAddress);

  const ethBalanceFloat = parseFloat(ethers.utils.formatEther(contractBalance));
  const liquidity = useContractReader(props.readContracts, contractName, "liquidity", [props.address]);

  const rowForm = (title, icon, onClick) => {
    return (
      <Row>
        <Col span={8} style={{ textAlign: "right", opacity: 0.333, paddingRight: 6, fontSize: 24 }}>
          {title}
        </Col>
        <Col span={16}>
          <div style={{ cursor: "pointer", margin: 2 }}>
            <Input
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

  if (props.readContracts && props.readContracts[contractName]) {
    display.push(
      <div>
        <Divider> Liquidity ({liquidity ? ethers.utils.formatEther(liquidity) : "none"}):</Divider>

        {rowForm("deposit", "📥", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          await tx(writeContracts[contractName]["deposit"]({ value: valueInEther, gasLimit: 200000 }));
        })}

        {rowForm("withdraw", "📤", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let withdrawTxResult = await tx(writeContracts[contractName]["withdraw"](valueInEther));
          console.log("withdrawTxResult:", withdrawTxResult);
        })}
      </div>,
    );
  }
  return (
    <Row span={24}>
      <Col span={12}>
        <Card
          title={
            <div>
              <Address value={contractAddress} />
              {/* <div style={{ float: "right", fontSize: 24 }}>
                {parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)} ⚖️
                <TokenBalance name={tokenName} img={"🎈"} address={contractAddress} contracts={props.readContracts} />
              </div> */}
            </div>
          }
          size="large"
          loading={false}
        >
          {display}
        </Card>
      </Col>
    </Row>
  );

}
