import validator from 'validator';
import {
  DatabaseClient,
  User,
} from '@/types';
import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';
import sum from 'lodash/sum';
import supabase from '@/lib/supabase';
import reverse from 'lodash/reverse';
import transformMessage from '@/lib/transformMessage';
import _ from 'lodash';
import superagent from 'superagent';

export default (
  db: DatabaseClient,
) => {
  return {
    createMessage: async function (
      userId: string,
      authorId: string,
      channelId: string,
      message: string,
    ) {
      // TODO
      return
    },
    getMessages: async function (
      channelId: string,
      before?: number,
      after?: number,
    ) {
      // only cache if we're not scrolling up
      let useCache = true;
      if (before != null || after != null) {
        useCache = false;
      }

      const PAGE_SIZE = 25;
      // @ts-ignore
      const messages = await db.message.findMany({
        where: {
          channel: {
            id: channelId,
          },
          isDeleted: false,
          ...(before ? { id: { lt: before } } : {}),
          ...(after ? { id: { gt: after } } : {}),
        },
        orderBy: {
          id: 'desc',
        },
        include: {
          author: {
            include: {
              user: true,
            },
          },
        },
        take: PAGE_SIZE + 1,
      });

      const hasMore = messages.length > PAGE_SIZE;
      const result = {
        messages: messages
          .slice(0, PAGE_SIZE)
          // @ts-ignore
          .map(message => transformMessage(message)),
        hasMore,
      };
      return result
    },
  };
};
