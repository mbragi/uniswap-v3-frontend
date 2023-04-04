import React from "react";
import { ethers } from "ethers";
import { GearFill } from "react-bootstrap-icons";
import { BeatLoader } from "react-spinners";
import PageButton from "./components/PageButton";
import ConnectButton from "./components/ConnectButton";
import ConfigModal from "./components/ConfigModal";
import CurrencyField from "./components/CurrencyField";
import {
  getWethContract,
  getUniContract,
  runSwap,
  getPrice,
} from "./AlphaRouterService";
import "./App.css";

export default function App() {
  const [provider, setProvider] = React.useState(undefined);
  const [signer, setSigner] = React.useState(undefined);
  const [signerAddress, setSignerAddress] = React.useState(undefined);
  const [slippageAmount, setSlippageAmount] = React.useState(2);
  const [deadLineMinutes, setDeadLineMinutes] = React.useState(10);
  const [showModal, setShowModal] = React.useState(false);
  const [inputAmount, setInputAmount] = React.useState(undefined);
  const [outputAmount, setOutputAmount] = React.useState(undefined);
  const [transaction, setTransaction] = React.useState(undefined);
  const [loading, setLoading] = React.useState(undefined);
  const [wethContract, setWethContract] = React.useState(undefined);
  const [wethAmount, setWethAmount] = React.useState(undefined);
  const [uniContract, setUniContract] = React.useState(undefined);
  const [uniAmount, setUniAmount] = React.useState(undefined);
  const [ratio, setRatio] = React.useState(undefined);

  React.useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      console.log(provider);
      setProvider(provider);
      const wethContract = getWethContract();
      setWethContract(wethContract);
      const uniContract = getUniContract();
      setUniContract(uniContract);
    };
    onLoad();
  }, []);

  //function to get signer
  const getSigner = async (provider) => {
    provider.send("eth_requestAccounts", []);
    const sign = await provider.getSigner();
    console.log("getSigner", sign);
    setSigner(sign);
  };

  //function to check if a wallet is currently connected
  const isConnected = () => signer !== undefined;
  //function to get wallet Address
  const getWalletAddress = async () => {
    const address = await signer.getAddress();
    setSignerAddress(address);
    const result = await wethContract.balanceOf(address);
    setWethAmount(Number(ethers.utils.formatEther(result)));
    const res = await uniContract.balanceOf(address);
    setUniAmount(Number(ethers.utils.formatEther(res)));
  };

  if (signer !== undefined) {
    getWalletAddress();
  }
  console.log(inputAmount);

  const getSwapPrice = async (inputAmount) => {
    setLoading(true);
    console.log(inputAmount);
    setInputAmount(inputAmount);
    const swap = getPrice(
      inputAmount,
      slippageAmount,
      Math.floor(Date.now() / 1000 + deadLineMinutes * 60),
      signerAddress
    ).then((data) => {
      setTransaction(data[0]);
      setOutputAmount(data[1]);
      setRatio(data[2]);
      setLoading(false);
    });
    console.log(await swap);
  };
  return (
    <div className="App">
      <div className="appNav">
        <div className="navigation">
          <div className="my-2 buttonContainer buttonContainerTop">
            <PageButton name={"Swap"} isBold={true} />
            <PageButton name={"Pool"} />
            <PageButton name={"Vote"} />
            <PageButton name={"Chart"} />
          </div>

          <div className="rightNav">
            <div className="connectButtonContainer">
              <ConnectButton
                provider={provider}
                isConnected={isConnected}
                signerAddress={signerAddress}
                getSigner={getSigner}
              />
            </div>
            <div className="my-2 buttonContainer">
              <PageButton name={"..."} isBold={true} />
            </div>
          </div>
        </div>
        <div className="appBody">
          <div className="swapContainer">
            <div className="swapHeader">
              <span className="swapText">Swap</span>
              <span
                className="gearContainer"
                onClick={() => setShowModal(true)}
              >
                <GearFill />
              </span>
              {showModal && (
                <ConfigModal
                  onClose={() => setShowModal(false)}
                  setDeadLineMinutes={setDeadLineMinutes}
                  deadLineMinutes={deadLineMinutes}
                  slippageAmount={slippageAmount}
                  setSlippageAmount={setSlippageAmount}
                />
              )}
            </div>
            <div className="swapBody">
              <CurrencyField
                field="input"
                tokenName="WETH"
                getSwapPrice={getSwapPrice}
                signer={signer}
                balance={wethAmount}
              />
              <CurrencyField
                field="output"
                tokenName="UNI"
                value={outputAmount}
                signer={signer}
                balance={uniAmount}
                spinner={BeatLoader}
                loading={loading}
              />
            </div>

            <div className="ratioContainer">
              {ratio && <>{`1 UNI = ${ratio} WETH`}</>}
            </div>

            <div className="swapButtonContainer">
              {isConnected() ? (
                <div
                  onClick={() => runSwap(transaction, signer)}
                  className="swapButton"
                >
                  Swap
                </div>
              ) : (
                <div onClick={() => getSigner(provider)} className="swapButton">
                  Connect Wallet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
