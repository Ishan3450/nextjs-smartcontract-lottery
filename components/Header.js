import React, { useEffect } from "react"
import { useMoralis } from "react-moralis"

const Header = () => {
    const { isWeb3EnableLoading, enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3 } = useMoralis()

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
                deactivateWeb3()
            }
        })
    }, [])

    return (
        <div>
            {account ? (
                <div>
                    {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {

                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect Wallet
                </button>
            )}
        </div>
    )
}

export default Header
