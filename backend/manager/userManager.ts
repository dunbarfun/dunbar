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
        // Create wallet
        const wallet = await db.wallet.create({
          data: {
            seed: uuidv4(),
            privateKey: uuidv4(),
            publicKey: uuidv4(),
            balance: 1000,
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

      // Minting
      const ownedSeeds = await db.seed.findMany({
        where: {
          ownerId: userId,
        },
        include: {
          issuer: true,
        },
      });

      const transactions = ownedSeeds.map(seed => ({
        id: seed.id,
        type: 'BUY',
        quantity: 1,
        priceSUI: 1000,
        ofUser: seed.issuer,
        byUser: user,
      }));

      if (!user) {
        return null;
      }

      return { ...user, transactions };
    },

    getUsers: async function () {
      const users = await db.user.findMany({
        include: {
          wallet: true,
        },
      });
      // TODO: Replace price here
      return users.map(u => ({ ...u, price: 1000 }));
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

        // TODO: Replace with actual price
        const seedPrice = 1000;

        const byUser = await db.user.findFirst({
          where: {
            id: byUserId,
          },
        });

        if (!byUser) {
          throw new Error('By user not found');
        }

        const ofUser = await db.user.findFirst({
          where: {
            id: ofUserId,
          },
        });

        await db.wallet.update({
          where: {
            id: byUser.walletId!,
          },
          data: {
            balance: {
              decrement: seedPrice,
            },
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
          await db.participant.create({
            data: {
              channelId,
              userId: byUserId,
            },
          });
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
  };
};
