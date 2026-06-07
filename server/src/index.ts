import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { connectDB } from './config/db';
import { env } from './config/env';
import { validateEnv } from './config/validate-env';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFound } from './middleware/validate';
import { initializeSocket } from './sockets/chat.socket';

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.get('/', (req, res) => {
  const baseUrl =
    process.env.RENDER_EXTERNAL_URL ||
    `${req.protocol}://${req.get('host')}`;

  res.json({
    success: true,
    message: 'MobiStore API Server',
    docs: `${baseUrl}/api/docs`,
    health: `${baseUrl}/api/health`,
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

initializeSocket(httpServer);

const start = async () => {
  validateEnv();
  await connectDB();
  httpServer.listen(env.port, () => {
    console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    console.log(`API Docs: http://localhost:${env.port}/api/docs`);
  });
};

start();

export default app;
