// @ts-nocheck
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, S3 } from "@aws-sdk/client-s3"
import fs from 'fs';
import stream from 'stream'
import sharp from 'sharp'

const r2 = new S3Client({
  region: 'auto',
  endpoint: 'ENDPOINT_HERE',
  credentials: {
    accessKeyId: 'ACCESS_KEY',
    secretAccessKey: 'SECRET_KEY'
  }
})

export default async function upload(
  bucket,
  key,
  mimetype,
  data,
) {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: mimetype,
  };

  try {
    // TODO: add content hash
    // Upload to r2
    const r2Upload = new Upload({
      client: r2,
      params,
      queueSize: 3, // optional concurrency configuration
    });
    const startR2 = Date.now() / 1000
    await r2Upload.done();
    const endR2 = Date.now() / 1000

    // r2 bucket
    return `R2_BUCKET_URL_HERE/${key}`
  } catch (e) {
    console.log(e);
    return null
  }
}

