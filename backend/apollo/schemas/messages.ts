import { gql } from 'apollo-server-express';
import { Dependencies } from '@/types';
import validator from 'validator';

export default ({
  db,
  messageManager,
}: Dependencies) => {
  const typeDefs = gql`
    type MessagesResponse {
      messages: [Message]
      hasMore: Boolean
    }
    extend type Query {
      messages(
        channelId: String!
        before: Int
        after: Int
      ): MessagesResponse
    }

    type CreateMessageResponse {
      message: Message!
      limited: Boolean!
      limitEnd: String
    }
    extend type Mutation {
      createMessage(
        channelId: String!
        authorId: String!
        message: String!
      ): CreateMessageResponse!
    }

    extend type Subscription {
      receivedMessage: Message!
    }
  `;

  const resolvers = {
    Query: {
      // @ts-ignore
      messages: async (
        _: any,
        { channelId, before, after }: any,
        { userId }: any
      ) => {
        return await messageManager.getMessages(
          channelId,
          before,
          after,
        );
      },
    },
    Mutation: {
      // @ts-ignore
      createMessage: async (
        _: any,
        { authorId, channelId, message }: any,
        { userId }: any
      ) => {
        return await messageManager.createMessage(
          userId,
          authorId,
          channelId,
          message
        );
      },
    },
    Subscription: {
      receivedMessage: {
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
