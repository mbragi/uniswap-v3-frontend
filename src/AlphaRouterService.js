const { AlphaRouter, SwapType } = require("@uniswap/smart-order-router");
const {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} = require("@uniswap/sdk-core");
const { ethers, BigNumber } = require("ethers");
const JSBI = require("jsbi"); // jsbi@3.2.5
const ERC20ABI = require("./abi.json");
const REACT_APP_ALCHEMY_URL_TESTNET = process.env.REACT_APP_ALCHEMY_URL_TESTNET;
const V3_SWAP_ROUTER_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; // taken from "SwapRouter02 (1.1.0)" => "https://docs.uniswap.org/protocol/reference/deployments"
console.log(REACT_APP_ALCHEMY_URL_TESTNET);
const chainId = 5;

const web3Provider = new ethers.providers.JsonRpcProvider(
  REACT_APP_ALCHEMY_URL_TESTNET
);
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider }); // Creating instance of `AlphaRouter`

const name0 = "Wrapped Ether";
const symbol0 = "WETH";
const decimals0 = 18;
const address0 = "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";

const name1 = "Uniswap Token";
const symbol1 = "UNI";
const decimals1 = 18;
const address1 = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

const WETH = new Token(chainId, address0, decimals0, symbol0, name0); // Creating instances of `WETH`
const UNI = new Token(chainId, address1, decimals1, symbol1, name1); // Creating instances of `UNI`

export const getWethContract = () =>
  new ethers.Contract(address0, ERC20ABI, web3Provider);
export const getUniContract = () =>
  new ethers.Contract(address1, ERC20ABI, web3Provider);

export const getPrice = async (
  inputAmount,
  slippageAmount,
  deadline,
  walletAddress
) => {
  const percentSlippage = new Percent(slippageAmount, 100); // converting `slippageAmount` into `percentage`
  const wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0); // converting `input amount` into `wei`
  const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei));

  // below code for `route` is taken from "https://github.com/Uniswap/smart-order-router/blob/main/src/routers/alpha-router/alpha-router.ts"
  const route = await router.route(currencyAmount, UNI, TradeType.EXACT_INPUT, {
    recipient: walletAddress,
    slippageTolerance: percentSlippage,
    deadline: deadline,
    type: SwapType.SWAP_ROUTER_02,
  });
  console.log(route);
  // const transaction = {
  //   data: route.methodParameters.calldata,
  //   to: V3_SWAP_ROUTER_ADDRESS,
  //   value: BigNumber.from(route.methodParameters.value),
  //   from: walletAddress,
  //   gasPrice: BigNumber.from(route.gasPriceWei),
  //   gasLimit: ethers.utils.hexlify(1000000), // this gas limit is very high but we can put some lower value on Mainnet
  // };

  // building a little data below here that will display in the UI so we'll say...
  const quoteAmountOut = route.quote.toFixed(6);
  const ratio = (inputAmount / quoteAmountOut).toFixed(3);

  return [quoteAmountOut, ratio];
};

// Now creating the transaction that actually runs the swap
export const runSwap = async (transaction, signer) => {
  // below we are approving `Uniswap` to access tokens that are present in our wallet
  const approvalAmount = ethers.utils.parseUnits("10", 18).toString();
  const contract0 = getWethContract(); // initializing this contract
  await contract0
    .connect(signer) // we can think it as of our wallet
    .approve(V3_SWAP_ROUTER_ADDRESS, approvalAmount); // approving the `UniswapV3 Swap Router` to take the `approved amount` from our wallet

  signer.sendTransaction(transaction);
};
