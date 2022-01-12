## 基本介绍

 - 一个基于 web3.js 的币安链去中心化交易所 PancakeSwap V2抢购脚本

## 主要功能

 - 监听区块链事件 - 流动对 PairCreated
 - 监听区块链事件 - 流动对 Mint
 - 自动 PancakeSwap 授权
 - 购买 Token
 - 自定义间隔出售 Token
 - 查询 Token 总量

 ## 结构说明

├── abi                             智能合约说明JSON文件
│   ├── coin.json
│   ├── pancakeFactoryV2.json
│   ├── pancakeLiquidPair.json
│   └── pancakeRouterV2.json
├── config.js                      配置
└── index.js                       主要程序