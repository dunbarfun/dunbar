import { merge } from 'lodash';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import middleware from '@/apollo/middleware';
import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { Dependencies } from '@/types';
import { GraphQLDateTime } from 'graphql-iso-date';

import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import jwt from 'jsonwebtoken';

import usersSchema from '@/apollo/schemas/users';

import enums from '@/apollo/enums';
import types from '@/apollo/types';

const init = gql`
  scalar DateTime

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }

  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

const datetimeResolver = { DateTime: GraphQLDateTime };

// @ts-ignore
const getDynamicContext = async (ctx, msg, args) => {
  return new Promise(async resolvePromise => {
    if (ctx.connectionParams.token) {
      // New token format
      const token = ctx.connectionParams.token;
      // @ts-ignore
      jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        // @ts-ignore
        if (!err && decoded?.userId != null) {
          // @ts-ignore
          resolvePromise({ userId: decoded.userId });
        } else {
          resolvePromise({ userId: null });
        }
      });
    } else {
      resolvePromise({ userId: null });
    }
  });
};

export default async (deps: Dependencies) => {
  const { httpServer, app } = deps;
  const port = process.env.PORT || 4000;

  const { typeDefs: usersTypedefs, resolvers: usersResolvers } =
    usersSchema(deps);

  const schema = makeExecutableSchema({
    typeDefs: [
      init,
      enums,
      ...types,
      usersTypedefs,
    ],
    resolvers: merge(
      usersResolvers,
    ),
  });
  const schemaWithMiddleware = applyMiddleware(schema, ...middleware);

  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/subscriptions',
  });
  const serverCleanup = useServer(
    {
      schema,
      // @ts-ignore
      context: (ctx, msg, args) => {
        return getDynamicContext(ctx, msg, args);
      },
      // @ts-ignore
      onDisconnect(ctx, code, reason) {},
      // @ts-ignore
      onConnect: ctx => {},
      // @ts-ignore
      onSubscribe: (ctx, msg) => {},
      // @ts-ignore
      onNext: (ctx, msg, args, result) => {},
      // @ts-ignore
      onError: (ctx, msg, errors) => {},
      // @ts-ignore
      onComplete: (ctx, msg) => {},
    },
    wsServer
  );

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      {
        // @ts-ignore
        requestDidStart(requestContext) {
          return {
            didEncounterErrors(ctx: any) {
              for (const err of ctx.errors) {
                console.error(err.message);
              }
            },
          };
        },
      },
    ],
    introspection: process.env.ENVIRONMENT === 'development',
    nodeEnv: process.env.ENVIRONMENT,
    formatError: (err) => {
      if (process.env.ENVIRONMENT === 'production') {
        return new Error('Internal server error');
      }
      return err;
    },
    context: ({ req }) => ({ req }),
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));
  console.info(
    `🚀 GraphQL server ready at http://localhost:${port}${server.graphqlPath}`
  );
};
