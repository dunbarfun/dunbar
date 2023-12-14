import { gql } from 'apollo-server-express';

export default gql`
  type Channel {
    id: String!

    participants: [Participant]
    messages: [Message]

    createdAt: DateTime
    updatedAt: DateTime
  }
`;
