"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const algosdk_1 = __importDefault(require("algosdk"));
const connect_1 = require("@perawallet/connect");
const utils_1 = require("@json-rpc-tools/utils");
const logo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIwSDE3LjUwNDdMMTUuODY5MyAxMy45NkwxMi4zNjI1IDIwSDkuNTYzNzVMMTQuOTc1OCAxMC42NDU2TDE0LjA5OTEgNy4zODE3TDYuNzk4NzQgMjBINEwxMy4yNTYxIDRIMTUuNzE3NkwxNi43Nzk4IDcuOTg3MzhIMTkuMzA4N0wxNy41ODkgMTAuOTgyMUwyMCAyMFoiIGZpbGw9IiMyQjJCMkYiLz4KPC9zdmc+Cg==";
class PeraConnect {
    constructor(network) {
        this.accounts = [];
        this.defaultAccount = 0;
        this.network = network;
        this.connector = new connect_1.PeraWalletConnect();
    }
    disconnect() {
        try {
            this.accounts = [];
            this.connector.disconnect();
        }
        catch (_) {
            try {
                this.connector.connector.killSession();
            }
            catch (_) { }
        }
    }
    connect() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            // Check if connection is already established
            if ((_a = this.connector.connector) === null || _a === void 0 ? void 0 : _a.connected)
                return true;
            let newAccounts;
            try {
                newAccounts = yield this.connector.reconnectSession();
                if (newAccounts.length) {
                    (_b = this.connector.connector) === null || _b === void 0 ? void 0 : _b.on("disconnect", this.disconnect);
                    this.accounts = newAccounts;
                    return true;
                }
            }
            catch (_) { }
            try {
                newAccounts = yield this.connector.connect();
                (_c = this.connector.connector) === null || _c === void 0 ? void 0 : _c.on("disconnect", this.disconnect);
                this.accounts = newAccounts;
                return true;
            }
            catch (error) {
                if (((_d = error === null || error === void 0 ? void 0 : error.data) === null || _d === void 0 ? void 0 : _d.type) !== "CONNECT_MODAL_CLOSED") {
                    // log the necessary errors
                    console.log(error);
                }
                else {
                    console.log("Modal closed by user");
                }
                return false;
            }
        });
    }
    static displayName() {
        return "Pera Wallet";
    }
    displayName() {
        return PeraConnect.displayName();
    }
    static img(inverted) {
        return logo;
    }
    img(inverted) {
        return PeraConnect.img(inverted);
    }
    isConnected() {
        var _a;
        return !!((_a = this.connector.connector) === null || _a === void 0 ? void 0 : _a.connected);
    }
    getDefaultAccount() {
        if (!this.isConnected())
            return "";
        return this.accounts[this.defaultAccount];
    }
    signTxn(txns) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const defaultAddress = this.getDefaultAccount();
            const txnsToSign = txns.map((txn) => {
                const encodedTxn = Buffer.from(algosdk_1.default.encodeUnsignedTransaction(txn)).toString("base64");
                if (algosdk_1.default.encodeAddress(txn.from.publicKey) !== defaultAddress)
                    return { txn: encodedTxn, signers: [] };
                return { txn: encodedTxn };
            });
            const request = (0, utils_1.formatJsonRpcRequest)("algo_signTxn", [txnsToSign]);
            const result = yield ((_a = this.connector.connector) === null || _a === void 0 ? void 0 : _a.sendCustomRequest(request));
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
        });
    }
    sign(txn) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    signBytes(b) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    signTeal(teal) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
}
exports.default = PeraConnect;
