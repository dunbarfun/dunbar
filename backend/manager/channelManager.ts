import validator from 'validator';
import { DatabaseClient, User } from '@/types';
import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';
import _ from 'lodash';

export default (db: DatabaseClient) => {
  const getUserChannels = async (userId: string) => {
    if (_.isNil(userId)) { return null;}
    // @ts-ignore
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        participants: {
          include: {
            channel: {
              include: {
                participants: {
                  include: {
                    user: true,
                  },
                },
                messages: {
                  orderBy: {
                    id: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
    // @ts-ignore
    return user?.participants.map(p => p.channel);
  };
  const createChannel = async (userId: string) => {
    // TODO
  };
  return {
    getUserChannels,
    createChannel,
  };
};
