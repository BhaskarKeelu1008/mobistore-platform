import { env } from './env';

const MONGODB_PLACEHOLDERS = [
  '<username>',
  '<password>',
  '<cluster>',
  'your_cluster',
  'your-cluster',
  'YOUR_CLUSTER',
  'xxxxx',
  'example.com',
];

export const validateEnv = (): void => {
  if (env.nodeEnv !== 'production') return;

  const uri = env.mongodbUri.toLowerCase();
  const hasPlaceholder = MONGODB_PLACEHOLDERS.some((token) => uri.includes(token));
  const usesLocalhost = uri.includes('localhost') || uri.includes('127.0.0.1');

  if (hasPlaceholder || usesLocalhost) {
    console.error(
      [
        'Invalid MONGODB_URI for production.',
        'Render is still using a placeholder connection string (e.g. YOUR_CLUSTER).',
        'In Render → Environment, set MONGODB_URI to your real Atlas URI from:',
        '  Atlas → Database → Connect → Drivers',
        'Example format:',
        '  mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/mobistore?retryWrites=true&w=majority',
        'Also ensure Atlas Network Access allows 0.0.0.0/0 for Render.',
      ].join('\n')
    );
    process.exit(1);
  }

  if (!env.jwtSecret || env.jwtSecret === 'dev-jwt-secret') {
    console.error('JWT_SECRET must be set to a strong random value in production.');
    process.exit(1);
  }

  if (!env.jwtRefreshSecret || env.jwtRefreshSecret === 'dev-refresh-secret') {
    console.error('JWT_REFRESH_SECRET must be set to a strong random value in production.');
    process.exit(1);
  }
};
