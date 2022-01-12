const BscId = 56
const BscNet = 'wss://bsc-ws-node.nariox.org:443'
const MaxHex = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const PancakeRouterV2 = '0x10ed43c718714eb63d5aa57b78b54704e256024e'
const PancakeFactoryV2 = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73'

const COIN = {
  BNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  BUSDT: '0x55d398326f99059fF775485246999027B3197955',
  CAKE: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
}

const ACCOUNT = {
  add: '?',
  key: '?'
}

const symbol = '?'
const token = '?'
const CONFIG = {
  coin: token,
  symbol,
  contract: new web3.eth.Contract(JSON.parse(fs.readFileSync('./abi/coin.json')), token),
  buyPath: [COIN.BNB, token],
  salePath: [token, COIN.BNB],
  saleInterval: Number.MAX_SAFE_INTEGER,
  gas: 1000000,
  minTokenCount: BigInt(0 * (10 ** 18)),
  buyETHCount: 1,
  buyGasPrice: 1,
  saleGasPrice: 1
}

module.exports = {
  BscId,
  BscNet,
  MaxHex,
  PancakeRouterV2,
  PancakeFactoryV2,
  COIN,
  ACCOUNT,
  CONFIG
}