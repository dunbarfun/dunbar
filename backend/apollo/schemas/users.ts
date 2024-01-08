import { gql } from 'apollo-server-express';
import { Dependencies } from '@/types';
import validator from 'validator';

export default ({ db, userManager }: Dependencies) => {
  const typeDefs = gql`
    type AuthResponse {
      user: User
      token: String
      error: String
      streamToken: String
    }

    type UserResponse {
      user: User
    }

    type UserUpdateResponse {
      user: User
      error: String
    }

    type UserPriceResponse {
      success: Boolean
      buyPrice: Float
      sellPrice: Float
      shares: Int
    }

    extend type Query {
      me: User
      getWallets: [Wallet]
      getUsers: [User]
      getUserPrices(userId: String!): UserPriceResponse
      getEvents: [Event]
    }

    type TradeResponse {
      success: Boolean!
    }

    extend type Mutation {
      auth(supabaseToken: String!, provider: String, email: String): AuthResponse!
      updateUser(username: String, avatar: String, name: String): UserUpdateResponse!
      mintSeed(ofUserId: String!, amount: Int): TradeResponse!
      sellSeed(ofUserId: String!, amount: Int): TradeResponse!
      withdraw(address: String): Boolean!
    }
  `;

  const resolvers = {
    Query: {
      // @ts-ignore
      me: async (parent, args, ctx) => {
        try {
          const userId = ctx.userId!;
          return await userManager.getUser(userId);
        } catch (e) {
          return null
        }
      },
      // @ts-ignore
      getUsers: async (parent, args, ctx) => {
        return await userManager.getUsers()
      },
      // @ts-ignore
      getUserPrices: async (parent, { userId }, ctx) => {
        try {
          const res = await userManager.getUserPrices(userId)
          return {
            success: true,
            ...res,
          }
        } catch (e) {
          return {
            success: false,
            error: e.message,
          }
        }
      },
      // @ts-ignore
      getEvents: async (parent, args, ctx) => {
        const userId = ctx.userId!;
        return await userManager.getEvents(userId);
      },
    },
    Mutation: {
      // @ts-ignore
      auth: async (parent, { supabaseToken, provider }, ctx) => {
        try {
          const { user, token, streamToken } = await userManager.auth(supabaseToken, provider);
          return { user, token, streamToken };
        } catch (e) {
          console.error(e);
          return { error: e.message };
        }
      },
      // @ts-ignore
      updateUser: async (
        parent: any,
        {
          // @ts-ignore
          username,
          // @ts-ignore
          avatar,
          // @ts-ignore
          name
        },
        ctx: any
      ) => {
        const userId = ctx.userId;
        try {
          const user = await userManager.updateUser(userId, {
            username,
            avatar,
            name
          });
          return {
            user,
            error: null,
          };
        } catch (e) {
          return {
            user: null,
            // @ts-ignore
            error: e.message,
          };
        }
      },
      // @ts-ignore
      mintSeed: async (parent, { ofUserId, amount }, ctx) => {
        const userId = ctx.userId
        return await userManager.mintSeed(ofUserId, userId, amount || 1)
      },
      // @ts-ignore
      sellSeed: async (parent, { ofUserId, amount }, ctx) => {
        const userId = ctx.userId
        return await userManager.sellSeed(ofUserId, userId, amount || 1)
      },
      // @ts-ignore
      withdraw: async (parent, { address }, ctx) => {
        const userId = ctx.userId
        return await userManager.withdraw(userId, address)
      },
    }
  };

  return {
    typeDefs,
    resolvers,
  };
};
