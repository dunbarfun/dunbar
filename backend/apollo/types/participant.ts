import { gql } from 'apollo-server-express';

export default gql`
  type Participant {
    id: String!
    userId: String
    user: User

    channelId: String!
    channel: Channel!

    messages: [Message]

    createdAt: DateTime
    updatedAt: DateTime
  }
`;
