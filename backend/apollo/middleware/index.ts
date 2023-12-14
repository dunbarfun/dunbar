import jwt from 'jsonwebtoken';
import humps from 'humps';

// @ts-ignore
const addUserIdToContext = async (resolve, root, args, context, info) => {
  return new Promise(async resolvePromise => {
    if (context.req.headers['x-access-token']) {
      // New token format
      const token = context.req.headers['x-access-token'] as string;
      // @ts-ignore
      jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        if (!err) {
          // @ts-ignore
          context.userId = decoded.userId;
        }
        const res = await resolve(root, args, context, info);
        resolvePromise(res);
      });
    } else {
      resolvePromise(await resolve(root, args, context, info));
    }
  });
};

// @ts-ignore
const addIsNode = async (resolve, root, args, context, info) => {
  if (context.req.headers['password'] === process.env.SECRET) {
    context.isNode = true;
  }
  return await resolve(root, args, context, info);
};

export default [addUserIdToContext, addIsNode];
