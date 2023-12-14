import { gql } from 'apollo-server-express';

export default gql`
  type User {
    id: String!
    supabaseUserId: String!
    ownedSeeds: [Seed]
    issuedSeeds: [Seed]
    wallet: Wallet
    streamToken: String
    
    username: String
    name: String
    avatar: String

    transactions: [Transaction]
    price: Float

    createdAt: DateTime
    updatedAt: DateTime
  }
`;
