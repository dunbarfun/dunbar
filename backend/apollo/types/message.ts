import { gql } from 'apollo-server-express';

export default gql`
  type Message {
    id: Int!
    type: String!
    message: String!
    context: String!

    authorId: String!
    author: Participant!

    channelId: String!
    channel: Channel!

    createdAt: DateTime
    updatedAt: DateTime
  }
`;
