import { gql } from 'apollo-server-express';
import { Dependencies } from '@/types';
import validator from 'validator';

export default ({ db, bookmarkManager }: Dependencies) => {
  const typeDefs = gql`
    extend type Query {
      bookmarks: [Bookmark]
    }

    input BookmarkRequest {
      channelId: String!
      lastSeen: String!
    }
    extend type Mutation {
      setBookmarks(bookmarks: [BookmarkRequest]!): Boolean
    }
    extend type Subscription {
      receivedBookmarks: [Bookmark]
    }
  `;

  const resolvers = {
    Query: {
      // @ts-ignore
      bookmarks: async (parent, args, ctx) => {
        if (!ctx.userId) {
          throw new Error('Not authenticated');
        }
        return bookmarkManager.getBookmarks(ctx.userId);
      },
    },
    Mutation: {
      // @ts-ignore
      setBookmarks: async (parent, { bookmarks }, ctx) => {
        if (!ctx.userId) {
          throw new Error('Not authenticated');
        }
        return bookmarkManager.setBookmarks(ctx.userId, bookmarks);
      },
    },
    Subscription: {
      receivedBookmarks: {
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
