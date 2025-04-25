## Overview
This Spring Boot application demonstrates the integration of Sol trading and GPT APIs, integrating third-party interfaces such as eBirdEye, CookieFun, Jupiter, QuickNode, etc., comprehensively analyzing tokens, and implementing token buying, selling, and transferring through chat. It can visually, simply, and vividly implement coin queries and transactions.
## Project Requirements

- Java 8
- Maven
- Spring Boot 2.3.7.RELEASE
- mysql 8.0.33
- gpt-4o
- redis redisson 3.14.1
## Transaction and Coin Information

Supports transaction parsing on Solana and Binance Smart Chain (BSC).

Information collection source.<br> Multi platform collection ensures accurate and secure data<br> 
<li>Collect coin prices and information using birdeye
<li>Collect ranking, attention, and other information using CookieFun
<li>Collect transaction pair information using Jupiter, etc
<li>Using QuickNode / EtherScan(BscScan) to retrieve on chain data
<li>Using QuickIntel to obtain token security information