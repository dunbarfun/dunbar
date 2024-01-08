import validator from 'validator';
import { DatabaseClient, StreamClient, User } from '@/types';
import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';
import sum from 'lodash/sum';
import slugify from 'slugify';
import supabase from '@/lib/supabase';
import transformMessage from '@/lib/transformMessage';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import dunbarClient from '@/lib/dunbarClient';

import {
  generateWallet,
} from '@/lib/passphrase';
import sui from '@/lib/sui';
import getBalance from '@/lib/getBalance';
import { MIST_PER_SUI } from '@mysten/sui.js/utils';
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { deriveKeypair } from '@/lib/passphrase';

const GAS_BUDGET = 100_000_000n; // 0.1 SUI

export default (db: DatabaseClient, stream: StreamClient) => {
  return {
    auth: async function (
      supabaseToken: string,
      provider?: 'web' | 'ios' | 'android'
    ) {
      const supabaseUser = await supabase.auth.getUser(supabaseToken);
      if (
        supabaseUser?.data?.user?.id == null ||
        supabaseUser?.data?.user?.email == null
      ) {
        throw new Error("Couldn't find user in supabase");
      }
      const supabaseUserId = supabaseUser.data.user.id;
      // @ts-ignore
      let user = await db.user.findUnique({
        where: {
          supabaseUserId,
        },
      });
      if (user == null) {
        const { mnemonic, publicKey } = generateWallet();
        // Create wallet
        const wallet = await db.wallet.create({
          data: {
            mnemonic,
            publicKey,
            balance: 0,
          },
        });

        // Create user if it doesn't exist
        user = await db.user.create({
          data: {
            supabaseUserId,
            avatar: null,
            walletId: wallet.id,
          },
        });
      }
      const userId = user.id;
      const streamToken = stream.createToken(userId);
      const token = jwt.sign({ userId }, process.env.SECRET!);
      return {
        user,
        token,
        streamToken,
      };
    },
    getUser: async function (userId: string) {
      // @ts-ignore
      let user = await db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          wallet: true,
        },
      });

      if (!user) {
        return null;
      }
      return user;
    },

    getUsers: async function () {
      const users = await db.user.findMany({
        include: {
          wallet: true,
        },
        where: {
          initialized: true,
        },
      });

      const cache = {}
      for (const user of users) {
        const userObjectId = user.userObjectId;
        if (userObjectId == null) {
          continue;
        }
        const userPrices = await dunbarClient.getUserPrice(userObjectId);
        // @ts-ignore
        cache[user.id] = userPrices;
        /*
        // TODO: use a cache here
        console.log('userPrices', userPrices);
        // const existingUserPrices = USER_PRICE_CACHE.get(userObjectId);
        // USER_PRICE_CACHE.set(userObjectId, userPrices);
        */
      }

      return users.map(user => ({
        ...user,
        // @ts-ignore
        ...cache[user.id],
        // @ts-ignore
        price: cache[user.id]?.buyPrice != null ? cache[user.id].buyPrice / Number(MIST_PER_SUI) : 0,
      }));
    },

    isValidUsername: async function (
      username: string
    ): Promise<{ message: string; valid: boolean }> {
      // Make sure username doesn't contain spaces
      if (validator.contains(username, ' ')) {
        return { message: 'Username cannot have spaces', valid: false };
      }

      // Make sure username is alphanumeric
      if (!validator.isAlphanumeric(username)) {
        return { message: 'Username must be alphanumeric', valid: false };
      }

      // Make sure username is between 3 and 20 characters
      if (!validator.isLength(username, { min: 5, max: 20 })) {
        return {
          message: 'Username must be between 5 and 20 characters',
          valid: false,
        };
      }

      const normalizedUsername = slugify(username.toLowerCase());

      // Username must not already be taken
      const existingUser = await db.user.findUnique({
        where: {
          username: normalizedUsername,
        },
      });
      if (existingUser != null) {
        return { message: 'Username is not available', valid: false };
      }

      return { message: 'Username is valid', valid: true };
    },

    updateUser: async function (userId: string, attrs: any): Promise<User> {
      const { username, avatar, name } = attrs;
      if (username != null && !validator.isAlphanumeric(username)) {
        throw new Error('Username must be alphanumeric');
      }
      if (
        username != null &&
        !validator.isLength(username, { min: 3, max: 20 })
      ) {
        throw new Error('Username must be between 3 and 20 characters');
      }
      if (username != null) {
        const existingUser = await db.user.findUnique({
          where: {
            username,
          },
        });
        if (existingUser != null) {
          throw new Error('Username already taken');
        }
      }
      if (avatar != null && !validator.isURL(avatar)) {
        throw new Error('Avatar must be a valid URL');
      }

      const user = await db.user.update({
        where: {
          id: userId,
        },
        data: {
          username: !_.isNil(username)
            ? slugify(username.toLowerCase())
            : undefined,
          avatar,
          name,
        },
      });
      if (user == null) {
        throw new Error('User not able to be updated');
      }
      // @ts-ignore
      return await this.getUser(userId);
    },

    mintSeed: async function (
      ofUserId: string,
      byUserId: string,
      amount: number
    ) {
      try {
        // Get last minted index
        let index = -1;

        const lastSeed = await db.seed.findFirst({
          where: {
            issuerId: ofUserId,
          },
          orderBy: {
            index: 'desc',
          },
        });

        if (!!lastSeed) {
          index = lastSeed.index;
        }

        const byUser = await db.user.findFirst({
          where: {
            id: byUserId,
          },
          include: {
            wallet: true,
          },
        });

        if (byUser == null) {
          throw new Error('By user not found');
        }

        const ofUser = await db.user.findFirst({
          where: {
            id: ofUserId,
          },
          include: {
            wallet: true,
          },
        });
        if (!ofUser) {
          throw new Error('Of user not found');
        }

        const ofUserObjectId = ofUser.userObjectId;
        if (ofUserObjectId == null) {
          throw new Error('Of user not yet initialized');
        }
        if (byUser.wallet == null || byUser.walletId == null) {
          throw new Error('By user wallet not yet initialized');
        }
        const userPrices = await dunbarClient.getUserPrice(ofUserObjectId);
        const seedPrice = userPrices.buyPrice;
        const byUserBalance = await sui.getBalance({
          owner: byUser.wallet.publicKey,
        });
        const byUserTotalBalance = byUserBalance.totalBalance;

        // Make sure user has enough money to mint
        if (Number(byUserTotalBalance) < seedPrice) {
          throw new Error('Not enough money to mint');
        }

        // Ok, we have enough: let's build and execute the txn
        const tx = new TransactionBlock();
        await dunbarClient.buyShares(tx, {
          userId: ofUserObjectId,
          numShares: 1,
          payment: seedPrice,
        });
        const keypair = deriveKeypair(byUser.wallet.mnemonic);
        const result = await sui.signAndExecuteTransactionBlock({
          transactionBlock: tx,
          signer: keypair,
          options: {
            showEvents: true,
            showEffects: true,
            showObjectChanges: true,
            showBalanceChanges: true,
          },
        });

        // Update user's balance after minting (check the chain);
        const suiAmount = await getBalance(byUser.wallet.publicKey)
        await db.wallet.update({
          where: {
            id: byUser.walletId,
          },
          data: {
            balance: suiAmount,
          },
        });

        // Mint a new seed
        await db.seed.create({
          data: {
            ownerId: byUserId,
            issuerId: ofUserId,
            index: index + 1,
          },
        });

        // Create stream + DB channel
        const channelId = ofUserId;

        const existingDbChannel = await db.channel.findUnique({
          where: {
            id: channelId,
          },
        });

        // Also create (via upsert) stream users
        await stream.upsertUsers([
          {
            id: byUserId,
          },
          {
            id: ofUserId,
          },
        ]);

        if (!existingDbChannel) {
          await db.channel.create({
            data: {
              id: channelId,
              ownerId: ofUserId,
            },
          });

          await db.participant.createMany({
            data: [ofUserId, byUserId].map(id => ({
              channelId,
              userId: id,
            })),
          });
        } else {
          // If there's already a participant, don't create a new one
          const existingParticipant = await db.participant.findFirst({
            where: {
              channelId,
              userId: byUserId,
            },
          });
          if (!existingParticipant) {
            await db.participant.create({
              data: {
                channelId,
                userId: byUserId,
              },
            });
          } else {
            console.log('participant already exists, no need to create');
          }
        }

        const filter = { id: { $in: [channelId] } };
        const sort = { };
        const streamChannels = await stream.queryChannels(filter, sort);
        const streamChannel = streamChannels[0];
        const streamChannelExists = !!streamChannel;
        if (!streamChannelExists) {
          const channel = await stream.channel('messaging', channelId, {
            members: [byUserId, ofUserId],
            created_by_id: ofUserId,
            ofUser: {
              id: ofUserId,
              name: ofUser?.name,
              avatar: ofUser?.avatar
            },
            byUser: {
              id: byUserId,
              name: byUser.name,
              avatar: byUser.avatar
            }
          });
          await channel.create();
        } else {
          // Add the buyer to the channel
          await streamChannel.addMembers([byUserId]);
        }

        return { success: true };
      } catch (err) {
        console.log('err', err);
        return { success: false };
      }
    },
    sellSeed: async function (
      ofUserId: string,
      byUserId: string,
      amount: number
    ) {
      try {
        const byUser = await db.user.findFirst({
          where: {
            id: byUserId,
          },
          include: {
            wallet: true,
          },
        });
        console.log('byUser', byUser);
        if (byUser == null) {
          throw new Error('By user not found');
        }
        const byUserObjectId = byUser.userObjectId;
        if (byUserObjectId == null) {
          throw new Error('By user not yet initialized');
        }
        const ofUser = await db.user.findFirst({
          where: {
            id: ofUserId,
          },
          include: {
            wallet: true,
          },
        });
        if (!ofUser) {
          throw new Error('Of user not found');
        }

        const ofUserObjectId = ofUser.userObjectId;
        if (ofUserObjectId == null) {
          throw new Error('Of user not yet initialized');
        }
        if (byUser.wallet == null || byUser.walletId == null) {
          throw new Error('By user wallet not yet initialized');
        }

        // Ok, first let's check if the user has enough seeds to sell
        const seed = await db.seed.findFirst({
          where: {
            ownerId: byUserId,
            issuerId: ofUserId,
          },
        });
        if (seed == null) {
          throw new Error('Seed not found');
        }

        // Ok, we have a seed: let's build and execute the txn
        const tx = new TransactionBlock();
        const shares = await dunbarClient.getSharesForUser(byUser.wallet.publicKey);
        console.log('shares', shares);
        // @ts-ignore
        console.log('shares', shares[0].data.content);

        // @ts-ignore
        const shareToSell = shares.find(share => share.data.content.fields.user_address === ofUser.wallet.publicKey);
        // If this is the only share, then we need to remove them from the chat
        // @ts-ignore
        const shouldRemoveFromChat = shares.filter(share => share.data.content.fields.user_address === ofUser.wallet.publicKey).length === 1;
        if (shareToSell == null) {
          throw new Error('Share not found');
        }
        // @ts-ignore
        const shareToSellId = shareToSell.data.content.fields.id.id;
        console.log('shareToSellId', shareToSellId);

        // Ok, now to actually sell the txn
        await dunbarClient.sellShares(tx, {
          userId: ofUserObjectId,
          sharesId: shareToSellId,
        });
        const keypair = deriveKeypair(byUser.wallet.mnemonic);
        const result = await sui.signAndExecuteTransactionBlock({
          transactionBlock: tx,
          signer: keypair,
          options: {
            showEvents: true,
            showEffects: true,
            showObjectChanges: true,
            showBalanceChanges: true,
          },
        });
        console.log('result', result);

        // Ok, now delete the seed
        await db.seed.delete({
          where: {
            id: seed.id,
          },
        });

        // If there are no more seeds, then remove from stream
        if (shouldRemoveFromChat) {
          console.log('shouldRemoveFromChat', shouldRemoveFromChat, 'removing');
          // also remove from stream
          const channelId = ofUserId;
          const filter = { id: { $eq: channelId } };
          const channels = await stream.queryChannels(filter, undefined, {
            state: true,
          });
          const channel = channels[0];
          if (channel == null) {
            throw new Error('Channel not found');
          }
          channel.removeMembers([byUserId]);

          // Also remove participant in db
          await db.participant.deleteMany({
            where: {
              channelId: ofUserId,
              userId: byUserId,
            },
          });
        }

        return { success: true };
      } catch (err) {
        console.log('err', err);
        return { success: false };
      }
    },

    withdraw: async function (
      userId: string,
      address: string,
    ) {
      console.log('withdraw here')
      console.log('userId', userId, address)
      // TODO: ensure it's a real address
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          wallet: true,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      const wallet = user.wallet;
      if (!wallet) {
        throw new Error('User does not have a wallet');
      }

      const keypair = deriveKeypair(wallet.mnemonic);

      const balance = await sui.getBalance({
        owner: wallet.publicKey,
      });
      const totalBalance = balance.totalBalance
      console.log('got balance', totalBalance)
      const amountToSend = BigInt(totalBalance) - GAS_BUDGET;
      console.log('amountToSend', amountToSend)

      const txb = new TransactionBlock();
      txb.setGasBudget(GAS_BUDGET);

			const [coin] = txb.splitCoins(txb.gas, [txb.pure(amountToSend)]);
			txb.transferObjects([coin], txb.pure(address));

      const result = await sui.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        signer: keypair,
        options: {
          showEvents: true,
          showEffects: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });
      console.log('result', result);
      console.log(result.balanceChanges);
      return true
    },
    getUserPrices: async function (userId: string) {
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (user == null || user.userObjectId == null) {
        throw new Error('User not found');
      }
      return await dunbarClient.getUserPrice(user.userObjectId);
    },
    getEvents: async function (userId: string) {
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          wallet: true,
        },
      });
      if (user == null) {
        throw new Error('User not found');
      }
      if (user.userObjectId == null || user.wallet == null) {
        return []
      }

      const userAddress = user.wallet?.publicKey;

      const res = await dunbarClient.getRecentTrades();
      let result = []
      for (const trade of res) {
        if (trade.trader === userAddress) {
          const target = await db.wallet.findUnique({
            where: {
              publicKey: trade.user,
            },
            include: {
              user: true,
            },
          });
          if (target?.user[0] == null) {
            continue;
          }
          result.push({
            ...trade,
            user: target.user[0],
          })
        }
      }
      console.log('res', result);
      return result
    },
  };
};
