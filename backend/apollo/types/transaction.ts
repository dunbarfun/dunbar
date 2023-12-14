import { gql } from 'apollo-server-express';

export default gql`
  enum TransactionType {
    MINT
    BUY
    SELL
  }

  type Transaction {
    id: String!
    type: TransactionType
    quantity: Int
    priceUSD: Float
    priceSUI: Float
    byUser: User
    ofUser: User
  }
`;
