import { Component } from '@angular/core';

import Web3 from 'web3';
import {Pool} from '@aave/contract-helpers';

declare var window: any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public web3: Web3;
  public provider: any;
  public userAddress: string;
  constructor() {
    
    // Create the web3 provider
    this.initMetamask();
  }
  
  getEthereumWalletProvider(walletType: string) {
    if (typeof window.ethereum !== "undefined") {
      let provider = window.ethereum;
      if (window.ethereum.providers?.length) {
        window.ethereum.providers.forEach(async (p: { [x: string]: any; }) => {
          if (p?.[walletType]) {
            provider = p;
          }
        });
      }
      return provider;
    }
  };
    
  async initMetamask() {
    this.provider = this.getEthereumWalletProvider('isMetaMask');
    if (this.provider) {
      this.web3 = new Web3(this.provider);
      this.saveUserInfo();
    } else {
      console.log(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  };

  async connectMetamask() {
    try {
      const provider = this.getEthereumWalletProvider('isMetaMask');
      if(provider) {
        this.initMetamask();
        await provider.request({ method: 'eth_requestAccounts' });
        this.saveUserInfo();
      } else {
        window.open("https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn")
      }
    } catch (err) {
      console.log(
        'There was an error fetching your accounts. Make sure your Ethereum client is configured correctly.'
      );
    }
  };

  async saveUserInfo() {
    const address = await this.web3.eth.getAccounts();
    this.userAddress = address[0];
  };

  async signTransaction() {
    // This is example of avant v3 signature
    const poll: any = new Pool(this.provider // or this.web.currentProvider 
      , {
      POOL: "0x794a61358D6845594F94dc1DB02A252b5b4814aD".toLocaleLowerCase(),
      WETH_GATEWAY: "0xa938d8536aEed1Bd48f548380394Ab30Aa11B00E".toLocaleLowerCase(),
    });
    const user: string = this.userAddress.toLowerCase();
    const reserve: string = "0xd586e7f844cea2f87f50152665bcbc2c279d8d70".toLowerCase();
    const amount: number = 1305007934104035;               
    const dataToSign: string = await poll.signERC20Approval({
      user,
      reserve,
      amount,
    });
  }
}
