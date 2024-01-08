import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export type ForceProperties<T, U> = { [P in keyof T]: U };

const ONE_SUI = 1_000_000_000;

interface DunbarUser {
  id: string;
  user_address: string;
  shares_outstanding: number;
  balance: number;
}

interface UserShare {
  id: string;
  user_address: string;
  shares: number;
}

export interface UserJoinedEvent {
  user_address: string;
}

export interface RecentTradeEvent {
  user: string;
  user_object: string;
  is_buy: boolean;
  trader: string;
  shares_traded: number;
  previous_share_count: number;
  new_share_count: number;
  price: number;
}

export interface BuySharesParams {
  userId: string;
  numShares: number;
  // In raw SUI: 1 = 10^-9 SUI
  payment: number;
}

export interface SellSharesParams {
  userId: string;
  sharesId: string;
}

function dunbarMethod(
  packageId: string,
  name: string
): `${string}::${string}::${string}` {
  return `${packageId}::main::${name}`;
}

export function getPrice(supply: number, amount: number): number {
  let sum1 =
    supply === 0 ? 0 : ((supply - 1) * supply * (2 * (supply - 1) + 1)) / 6;
  let sum2 =
    supply === 0 && amount === 1
      ? 0
      : ((supply + amount - 1) *
          (supply + amount) *
          (2 * (supply + amount - 1) + 1)) /
        6;
  let summation = sum2 - sum1;
  return (summation * ONE_SUI) / 16000;
}

export function getBuyPrice(supply: number, amount: number): number {
  return getPrice(supply, amount);
}

export function getSellPrice(supply: number, amount: number): number {
  return getPrice(amount - supply, supply);
}

export class DunbarClient {
  private suiClient: SuiClient;
  private packageId: string;
  private globalObjectId: string;

  constructor(suiClient: SuiClient, packageId: string, globalObjectId: string) {
    this.suiClient = suiClient;
    this.packageId = packageId;
    this.globalObjectId = globalObjectId;
  }

  async getUsers() {
    const { data } = await this.suiClient.queryEvents({
      query: {
        MoveEventType: `${this.packageId}::main::UserJoinedEvent`,
      },
    });
    const events = data.map((d) => d.parsedJson as UserJoinedEvent);
    return events;
  }

  async getRecentTrades() {
    const { data } = await this.suiClient.queryEvents({
      query: {
        MoveEventType: `${this.packageId}::main::ShareTradeEvent`,
      },
    });
    return data.map((d) => d.parsedJson as RecentTradeEvent);
  }

  async getSharesForUser(address: string) {
    const objectType = `${this.packageId}::main::UserShare`;
    const { data } = await this.suiClient.getOwnedObjects({ owner: address });
    const results = await Promise.all(
      data.map((d) =>
        this.suiClient.getObject({
          id: d.data?.objectId as string,
          options: { showType: true, showContent: true },
        })
      )
    );
    return results.filter((r) => r.data?.type === objectType);
  }

  async initUser(tx: TransactionBlock) {
    tx.moveCall({
      target: dunbarMethod(this.packageId, "init_user"),
      arguments: [tx.object(this.globalObjectId)],
    });
  }

  async buyShares(tx: TransactionBlock, params: BuySharesParams) {
    const coin = tx.splitCoins(tx.gas, [tx.pure(params.payment)]);
    tx.moveCall({
      target: dunbarMethod(this.packageId, "buy_shares_wrapper"),
      arguments: [
        tx.object(params.userId),
        tx.pure(params.numShares, "u64"),
        coin,
      ],
    });
  }

  async sellShares(tx: TransactionBlock, params: SellSharesParams) {
    tx.moveCall({
      target: dunbarMethod(this.packageId, "sell_shares_wrapper"),
      arguments: [tx.object(params.userId), tx.object(params.sharesId)],
    });
  }

  async getUserPrice(userObjectId: string) {
    const obj = await this.suiClient.getObject({
      id: userObjectId,
      options: { showContent: true },
    });
    if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
      throw new Error("No user object");
    }

    const userRaw = obj.data?.content.fields as ForceProperties<
      DunbarUser,
      string
    >;
    const shares = Number(userRaw.shares_outstanding as string);
    const buyPrice = getBuyPrice(shares, 1);
    const sellPrice = getSellPrice(shares, 1);
    return { buyPrice, sellPrice, shares };
  }
}
