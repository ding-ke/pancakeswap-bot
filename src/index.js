const fs = require('fs')
const dayjs = require('dayjs')
const Web3 = require('web3')
const { BscId, BscNet, MaxHex, PancakeRouterV2, PancakeFactoryV2, COIN, ACCOUNT, CONFIG } = require('./config')
const ws = new Web3.providers.WebsocketProvider(BscNet)
const web3 = new Web3(ws)
const PancakeContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('./src/abi/pancakeRouterV2.json')), PancakeRouterV2)
const PancakeFactoryContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('./src/abi/pancakeFactoryV2.json')), PancakeFactoryV2)

let nonce = 0
let blockNum = 0
start()

async function start () {
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} Ready！`)
  blockNum = await web3.eth.getBlockNumber()
  nonce = await web3.eth.getTransactionCount(ACCOUNT.add)
  listenPairCreateEvent(CONFIG)
  listenMintEvent(CONFIG)
  setInterval(() => { ws.send({id: 1}) }, 30000)
}

async function listenPairCreateEvent (config) {
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】开始监听：流动对 PairCreated 事件`)
  PancakeFactoryContract.events.PairCreated({ fromBlock: blockNum }, (err, event) => {
    if (err) return console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】流动对 PairCreated 事件错误：${err}`)
    const { token0, token1 } = event.returnValues
    if (parseInt(token0) === parseInt(config.coin)) {
      console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】流动对 PairCreated 事件触发`)
      preBuyToken(config, token1)
    } else if (parseInt(token1) === parseInt(config.coin)) {
      console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】流动对 PairCreated 事件触发`)
      preBuyToken(config, token0)
    }
  })
}

async function listenMintEvent (config) {
  const coinList = [COIN.BNB, COIN.BUSD, COIN.BUSDT]
  for (let i = 0; i < coinList.length; i++) {
    const pairAddress = await PancakeFactoryContract.methods.getPair(coinList[i], config.coin).call()
    if (parseInt(pairAddress)) {
      console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】开始监听：流动对 Mint 事件 ${coinList[i]} & ${config.coin}`)
      const PancakeLiquidPairContract = new web3.eth.Contract(JSON.parse(fs.readFileSync('./src/abi/pancakeLiquidPair.json')), pairAddress)
      PancakeLiquidPairContract.events.Mint({ fromBlock: blockNum },(err, event) => {
        if (err) return console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】流动对 Mint 事件错误：${err}`)
        console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】流动对事件 Mint 触发：${pairAddress} ${event}`)
        preBuyToken(config, coinList[i])
      })
    }
  }
}

function preBuyToken (config, coin) {
  if (config.isBought) return
  if (parseInt(coin) !== parseInt(COIN.BNB)) {
    config.buyPath[1] = coin
    config.buyPath.push(config.coin)
    config.salePath = Array.from(config.buyPath).reverse()
  }
  config.isBought = true
  buyToken(config)
  preSaleToken(config)
}

async function buyToken (config) {
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】触发购买任务`)
  const data = PancakeContract.methods.swapExactETHForTokens(
    config.minTokenCount,
    config.buyPath,
    account.add,
    Math.trunc((Date.now() + 60000 * 10) / 10 ** 3)
  ).encodeABI()

  const signedTx = await web3.eth.accounts.signTransaction({
    nonce: nonce++,
    chainId: BscId,
    to: PancakeRouterV2,
    data,
    value: config.buyETHCount * (10 ** 18),
    gasPrice: config.buyGasPrice * 5000000000,
    gas: config.gas
  }, account.key)
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】开始广播购买交易`)
  const res = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】购买结果：${res.status} ${res.transactionHash}`)
  await balanceOf(config)
}

async function preSaleToken (config) {
  setTimeout(() => {
    console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】触发售出任务`)
    saleToken(config)
  }, 1000 * config.saleInterval)
  await approvePancake(config)
}

async function saleToken (config) {
  const total = await balanceOf(config)
  const data = PancakeContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
    total,
    0,
    config.salePath,
    account.add,
    Math.trunc((Date.now() + 60000 * 10) / 10 ** 3)
  ).encodeABI()

  const signedTx = await web3.eth.accounts.signTransaction({
    nonce: nonce++,
    chainId: BscId,
    to: PancakeRouterV2,
    data,
    gasPrice: config.saleGasPrice * 5000000000,
    gas: config.gas
  }, account.key)
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】开始广播出售交易`)
  const res = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】出售结果：${res.status} ${res.transactionHash}`)
}

async function balanceOf (config) {
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】开始查询数量`)
  const res = await config.contract.methods.balanceOf(account.add).call()
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】当前数量：${res}`)
  return res
}

async function approvePancake (config) {
  const data = config.contract.methods.approve(PancakeRouterV2, MaxHex).encodeABI()
  const signedTx = await web3.eth.accounts.signTransaction({
    nonce: nonce++,
    chainId: BscId,
    to: config.coin,
    data,
    gasPrice: 5000000000,
    gas: config.gas
  }, account.key)
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】开始获取 Token 授权`)
  const res = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')} 【${config.symbol}】授权结果：${res.status} ${res.transactionHash}`)
}
