import React from 'react'
import {ConnectButton} from "web3uikit";

const CheatyHeader = () => {
  return (
    <div>
        <ConnectButton moralisAuth={false}/>
    </div>
  )
}

export default CheatyHeader