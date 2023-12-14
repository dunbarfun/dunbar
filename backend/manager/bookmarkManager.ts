import { DatabaseClient, Character, User } from '@/types';

type BookmarkRequest = {
  channelId: string;
  lastSeen: string;
}
export default (db: DatabaseClient) => {
  const getBookmarks = async (userId: string) => {
    return await db.bookmark.findMany({
      where: {
        userId,
      },
    });
  }
  const setBookmarks = async (userId: string, bookmarks: BookmarkRequest[]) => {
    for (const bookmark of bookmarks) {
      await db.bookmark.upsert({
        where: {
          userId_channelId: {
            userId,
            channelId: bookmark.channelId,
          },
        },
        update: {
          lastSeen: bookmark.lastSeen,
        },
        create: {
          userId,
          channelId: bookmark.channelId,
          lastSeen: bookmark.lastSeen,
        },
      });
    }

    const bookmarksToSend = await getBookmarks(userId);

    return true;
  }
  return {
    getBookmarks,
    setBookmarks,
  };
};
