import algosdk, { Transaction, TransactionParams } from "algosdk";
import { PermissionCallback, SignedTxn, Wallet } from "./wallet";

import { PeraWalletConnect } from "@perawallet/connect";

import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

const logo =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIwSDE3LjUwNDdMMTUuODY5MyAxMy45NkwxMi4zNjI1IDIwSDkuNTYzNzVMMTQuOTc1OCAxMC42NDU2TDE0LjA5OTEgNy4zODE3TDYuNzk4NzQgMjBINEwxMy4yNTYxIDRIMTUuNzE3NkwxNi43Nzk4IDcuOTg3MzhIMTkuMzA4N0wxNy41ODkgMTAuOTgyMUwyMCAyMFoiIGZpbGw9IiMyQjJCMkYiLz4KPC9zdmc+Cg==";

class PeraConnect implements Wallet {
  accounts: string[];
  defaultAccount: number;
  network: string;
  connector: PeraWalletConnect;
  permissionCallback?: PermissionCallback;

  constructor(network: string) {
    this.accounts = [];
    this.defaultAccount = 0;
    this.network = network;
    this.connector = new PeraWalletConnect();
  }

  disconnect() {
    try {
      this.accounts = [];
      this.connector.disconnect();
    } catch (_) {
      try {
        this.connector.connector.killSession();
      } catch (_) {}
    }
  }

  async connect(): Promise<boolean> {

    // Check if connection is already established
    if (this.connector.connector?.connected) return true;

    let newAccounts: string[]
    try {
      newAccounts = await this.connector.reconnectSession()
      if (newAccounts.length) {
          this.connector.connector?.on("disconnect", this.disconnect);
          this.accounts = newAccounts;
          return true
      }
    } catch (_) {}

    try {
      newAccounts = await this.connector.connect()
      this.connector.connector?.on("disconnect", this.disconnect);
      this.accounts = newAccounts;
      return true
    } catch (error) {
      if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          // log the necessary errors
          console.log(error)
      } else {
          console.log("Modal closed by user")
      }
      return false
    }

  }

  static displayName(): string {
    return "Pera Wallet";
  }
  displayName(): string {
    return PeraConnect.displayName();
  }

  static img(inverted: boolean): string {
    return logo;
  }
  img(inverted: boolean): string {
    return PeraConnect.img(inverted);
  }

  isConnected(): boolean {
    return !!this.connector.connector?.connected;
  }

  getDefaultAccount(): string {
    if (!this.isConnected()) return "";
    return this.accounts[this.defaultAccount];
  }

  async signTxn(txns: Transaction[]): Promise<SignedTxn[]> {
    const defaultAddress = this.getDefaultAccount();
    const txnsToSign = txns.map((txn) => {
      const encodedTxn = Buffer.from(
        algosdk.encodeUnsignedTransaction(txn)
      ).toString("base64");

      if (algosdk.encodeAddress(txn.from.publicKey) !== defaultAddress)
        return { txn: encodedTxn, signers: [] };
      return { txn: encodedTxn };
    });

    const request = formatJsonRpcRequest("algo_signTxn", [txnsToSign]);

    const result: string[] = await this.connector.connector?.sendCustomRequest(request);

    return result.map((element, idx) => {
      return element
        ? {
            txID: txns[idx].txID(),
            blob: new Uint8Array(Buffer.from(element, "base64")),
          }
        : {
            txID: txns[idx].txID(),
            blob: new Uint8Array(),
          };
    });
  }

  async sign(txn: TransactionParams): Promise<SignedTxn> {
    throw new Error("Method not implemented.");
  }

  async signBytes(b: Uint8Array): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  async signTeal(teal: Uint8Array): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }
}

export default PeraConnect;
