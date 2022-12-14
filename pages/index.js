import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { useMoralis, useWeb3Contract } from "react-moralis"
import React, { useEffect, useState } from "react"
import { Blockie, ConnectButton, NativeBalance, useNotification } from "web3uikit"
// import CheatyHeader from "../components/CheatyHeader"
import { address, abi } from "../constants/index"
import { ethers } from "ethers"

export default function Home() {
    const {
        isWeb3EnableLoading,
        enableWeb3,
        account,
        isWeb3Enabled,
        Moralis,
        deactivateWeb3,
        chainId: chainIdHex /* chainId will return the id in hex foramt*/,
    } = useMoralis()

    const chainId = parseInt(chainIdHex)
    const lotteryAddress = chainId in address ? address[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [totalNumberOfPlayers, setTotalNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const dispatch = useNotification()

    useEffect(() => {
        if (isWeb3Enabled) return

        if (
            !isWeb3Enabled &&
            typeof window !== "undefined" &&
            window.localStorage.getItem("connected")
        ) {
            enableWeb3()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            if (account == null) {
                // will trigger when user change the account
                window.localStorage.removeItem("connected")
                deactivateWeb3()
            }
        })
    }, [])

    // * Calling functions from our lottery smartcontract
    const { runContractFunction: enterLottery, isLoading, isFetching } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const {runContractFunction: getNumberOfPlayers} = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const {runContractFunction: getRecentWinner} = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    })


    async function updateUI() {
        // calling function from the contract
        const entranceFeeUsingCall = (await getEntranceFee()).toString()
        const numPlayersUsingCall = (await getNumberOfPlayers()).toString()
        const recentWinnerUsingCall = await getRecentWinner()
        
        // setting the values of called functions 
        setEntranceFee(entranceFeeUsingCall)
        setTotalNumberOfPlayers(numPlayersUsingCall)
        setRecentWinner(recentWinnerUsingCall)

        // can add console.logs below if you wish
    }

    // TODO : Listen for event from our smartcontract

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    // * Notifications from web3uikit
    const handleSuccess = async function (tx){
        await tx.wait(1)
        handleNewNotification('success', 'Transaction Notification', 'Entered Lottery Successfully !!')
        updateUI()
    }

    const handleError = function (error){
        handleNewNotification('error', 'Error Notification', 'Something went wrong !!')
    }

    const handleNewNotification = async function (typeOf, title, message) {
        dispatch(
            {
                type: typeOf,
                message: message,
                title: title,
                position: "bottomR",
                icon: "bell",
                
            }
        )
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
                {/* bootstrap */}
                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
                    crossOrigin="anonymous"
                ></link>
            </Head>
            {/* <CheatyHeader/> */}

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Decentralized <a href="#">Lottery</a>
                </h1>

                <p className={styles.description}>
                    {account ? (
                        <span>
                            Welcome,{" "}
                            <code className={styles.code}>
                                {account.slice(0, 6)}...{account.slice(account.length - 4)}
                            </code>
                            
                            ( <NativeBalance /> )

                        </span>
                    ) : (
                        <code
                            className={styles.code}
                            onClick={async () => {
                                await enableWeb3()

                                if (typeof window !== "undefined") {
                                    window.localStorage.setItem("connected", "injected")
                                }
                            }}
                        >
                            {isWeb3EnableLoading ? (
                                <span>Connecting...</span>
                            ) : (
                                <span>Connect Wallet</span>
                            )}
                        </code>
                    )}
                </p>

                {lotteryAddress ? (
                    <div className={styles.grid}>
                        {/* <a href="#" className={styles.card}>
                            <h2>Account Balance &rarr;</h2>
                            <hr />
                            <p className="pt-1">
                                <code className={styles.code}><NativeBalance /> ETHs</code>
                            </p>
                        </a> */}

                        <a href="#" className={styles.card}>
                            <h2>Lottery Entrance Fee &rarr;</h2>
                            <hr />
                            <p>
                                {ethers.utils.formatUnits(entranceFee)} <span>Ethers</span>
                            </p>
                        </a>

                        <a href="#" className={styles.card}>
                            <h2>Lottery &rarr;</h2>
                            <hr />
                            <p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={async function () {
                                        await enterLottery({
                                            onSuccess: handleSuccess,
                                            onError: (error) => {console.log(error); handleError}
                                        })
                                    }}
                                    disabled={isLoading || isFetching}
                                >
                                    {isLoading || isFetching ? (
                                        <div>
                                            Entering lottery...
                                        </div>
                                    ) : (
                                        <div>Enter Lottery</div>
                                    )}
                                    
                                </button>
                            </p>
                        </a>

                        <a href="#" className={styles.card}>
                            <h2>Total Players &rarr;</h2>
                            <hr />
                            <p>Players: {totalNumberOfPlayers} </p>
                        </a>
                        
                        <a href="#" className={styles.card}>
                            <h2>Winner &rarr;</h2>
                            <hr />
                            <p>Recent Winner: {recentWinner.slice(0,6)}...{recentWinner.slice(recentWinner.length - 4)}</p>
                        </a>
                    </div>
                ) : account ? (
                    <div className={styles.grid}>
                        <a href="#" className={styles.card}>
                            <h2>Oh Uh.... &rarr;</h2>
                            <hr />
                            <p>No Lottery Address Detected !!</p>
                        </a>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        <a href="#" className={styles.card}>
                            <h2>No Account found</h2>
                            <hr />
                            <p>Please connect your wallet first</p>
                        </a>
                    </div>
                )}
            </main>

            <footer className={styles.footer}>
                <a href="#" target="_blank" rel="noopener noreferrer">
                    Powered by{" "}
                    <span className={styles.logo}>
                        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
                    </span>
                </a>
            </footer>
        </div>
    )
}
