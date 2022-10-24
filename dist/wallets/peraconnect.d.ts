import { Transaction, TransactionParams } from "algosdk";
import { PermissionCallback, SignedTxn, Wallet } from "./wallet";
import { PeraWalletConnect } from "@perawallet/connect";
declare class PeraConnect implements Wallet {
    accounts: string[];
    defaultAccount: number;
    network: string;
    connector: PeraWalletConnect;
    permissionCallback?: PermissionCallback;
    constructor(network: string);
    disconnect(): void;
    connect(): Promise<boolean>;
    static displayName(): string;
    displayName(): string;
    static img(inverted: boolean): string;
    img(inverted: boolean): string;
    isConnected(): boolean;
    getDefaultAccount(): string;
    signTxn(txns: Transaction[]): Promise<SignedTxn[]>;
    sign(txn: TransactionParams): Promise<SignedTxn>;
    signBytes(b: Uint8Array): Promise<Uint8Array>;
    signTeal(teal: Uint8Array): Promise<Uint8Array>;
}
export default PeraConnect;
