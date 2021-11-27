import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" /*target="_blank" rel="noopener noreferrer"*/>
      <PageHeader
        title="🏗 scaffold-eth"
        subTitle="Challenge 2 Token Vendor forked by David Ryan (dryan.eth)"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
