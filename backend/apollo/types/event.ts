import { gql } from 'apollo-server-express';

export default gql`
  type Event {
    is_buy: Boolean!
    price: Float!
    user: User!
  }
`;
