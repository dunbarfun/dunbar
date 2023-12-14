import { StreamChat } from 'stream-chat';

export default () => StreamChat.getInstance(
  process.env.STREAM_ACCESS_KEY as string,
  process.env.STREAM_ACCESS_SECRET as string,

);
