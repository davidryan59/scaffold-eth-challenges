import React from "react";

export default function TempTodo(props) {
  return (
    <div style={{ lineHeight: 2, fontSize: 16, padding: 50, textAlign: "left" }}>
      <div><b><u>Game Demo - Issues List</u></b></div>
      <div><i>App currently under development. Use only with testnet funds.</i></div>
      <div>&nbsp;</div>
      <div>Please send in PRs if you want to fix any of the issues below. Also to add issues.</div>
      <div>&nbsp;</div>
      <div>•&nbsp; "Stats from last game" need to be only for player, not for the whole contract. Either store "last" values in contract by address, or do it entirely through UI.</div>
      <div>•&nbsp; Identify and fix occasional bug with "Player WON! 0.0 Ξ returned" and number below threshold, green background</div>
      <div>•&nbsp; Improve formatting of stake slider: colour too dark, handle too small</div>
      <div>•&nbsp; Game buttons: improve consistency - some have Ether amounts, some do not.</div>
      <div>•&nbsp; Game buttons: tell the player what the payout for win is, before they press the button<  /div>
      <div>•&nbsp; Game buttons: disable each button in turn if house stake would exceed the maximum allowed (approx 10% of house balance)</div>
      <div>•&nbsp; Slow down gameplay - have a confirmation screen for each game - especially for higher stakes > 0.01 ETH</div>
      <div>•&nbsp; Animations suitable to each game while awaiting result of transaction (coins flipping, dice rolling, roulette ball spinning, etc</div>
      <div>•&nbsp; Currently the light mode breaks the background colours</div>
      <div>•&nbsp; If this branch makes it to its own repo, convert this .jsx issues list into proper GitHub Issues</div>
      <div>•&nbsp; Tests for the Solidity</div>
      <div>•&nbsp; Tests for the JSX</div>
      <div>•&nbsp; Finish linting with Prettier</div>
      <div>&nbsp;</div>
      <div>This demo gaming app was developed by David Ryan (dryan.eth) using Scaffold-eth framework.</div>
      <div>App only intended to be used on Ethereum testnets, with free testnet $ETH.</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
    </div>
  );
}
