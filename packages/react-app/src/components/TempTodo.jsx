import React from "react";

export default function TempTodo(props) {
  return (
    <div style={{ lineHeight: 2, fontSize: 16, padding: 50, textAlign: "left" }}>
      <div><b><u>Game Demo - Issues List</u></b></div>
      <div><i>App currently under development. Use only with testnet funds.</i></div>
      <div>&nbsp;</div>
      <div>PRs are welcome to either add to this list, or fix issues on this list!</div>
      <div>&nbsp;</div>
      <div>•&nbsp; "Stats from last game" need to be only for player, not for the whole contract</div>
      <div>•&nbsp; Hide "Stats from last game" content if 0 games played (by the player), and make grey background</div>
      <div>•&nbsp; Improve formatting of stake slider: colour too dark, handle too small</div>
      <div>•&nbsp; Buttons: improve consistency - some have Ether amounts, some do not.</div>
      <div>•&nbsp; Buttons: identify payout for win</div>
      <div>•&nbsp; Buttons: disabled if house stake would exceed the maximum allowed (approx 10% of house balance)</div>
      <div>•&nbsp; Make Solidity error messages more user friendly</div>
      <div>•&nbsp; Identify and fix occasional bug with "Player WON! 0.0 Ξ returned" and number below threshold, green background</div>
      <div>•&nbsp; Slow down gameplay - have a confirmation screen for each game - especially for higher stakes > 0.01 ETH</div>
      <div>•&nbsp; Animations suitable to each game while awaiting result of transaction (coins flipping, dice rolling, roulette ball spinning, etc</div>
      <div>•&nbsp; Light mode breaks background colours!</div>
      <div>•&nbsp; Tests for the Solidity</div>
      <div>•&nbsp; Tests for the JSX</div>
      <div>•&nbsp; Finish linting with Prettier</div>
      <div>&nbsp;</div>
      <div>This demo gaming app was developed by David Ryan (dryan.eth) using Scaffold-eth framework.</div>
      <div>App only intended to be used on Ethereum testnets, with free testnet $ETH.</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
    </div>
  );
}
