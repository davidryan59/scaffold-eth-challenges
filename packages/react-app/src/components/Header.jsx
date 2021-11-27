import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" /*target="_blank" rel="noopener noreferrer"*/>
      <PageHeader
        title="🏗 scaffold-eth"
        subTitle="Challenge 1 Staking App forked by David Ryan (dryan.eth)"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
