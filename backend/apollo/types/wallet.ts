import { gql } from 'apollo-server-express';

export default gql`
  type Wallet {
    id: String!
    publicKey: String!
    balance: Float
  }
`;
