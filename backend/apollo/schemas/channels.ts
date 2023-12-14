import { gql } from 'apollo-server-express';
import { Dependencies } from '@/types';
import validator from 'validator';

export default ({ db, channelManager }: Dependencies) => {
  const typeDefs = gql`
    extend type Query {
      userChannels: [Channel]
    }

    extend type Mutation {
      createChannel(userId: String!): Channel
    }

    extend type Subscription {
      receivedChannel: Channel!
    }
  `;

  const resolvers = {
    Query: {
      // @ts-ignore
      userChannels: async (parent, args, ctx) => {
        return await channelManager.getUserChannels(ctx.userId);
      },
    },
    Mutation: {
      // @ts-ignore
      createChannel: async (parent, args, ctx) => {
        const userId = ctx.userId;
        return await channelManager.createChannel(userId);
      },
    },
    Subscription: {
      receivedChannel: {
        // @ts-ignore
        subscribe: async (_: any, args: any, { userId }: any) => {
          if (!userId) {
            throw new Error('Not authenticated');
          }
        },
      },
    },
  };

  return {
    typeDefs,
    resolvers,
  };
};
