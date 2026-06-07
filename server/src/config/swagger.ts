import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MobiStore Platform API',
      version: '1.0.0',
      description: 'Complete Mobile Shop E-Commerce API Documentation',
    },
    servers: [
      { url: `http://localhost:${env.port}/api`, description: 'Development' },
      { url: 'https://your-api.onrender.com/api', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
