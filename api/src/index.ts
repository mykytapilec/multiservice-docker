import express from 'express';
import { connectMongoDB, disconnectMongoDB } from './config/mongodb.js';
import { connectRedis, disconnectRedis } from './config/redis.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api',
  });
});

async function startServer(): Promise<void> {
  try {
    await connectMongoDB();
    await connectRedis();

    const server = app.listen(PORT, HOST, () => {
      console.log(`API service listening on ${HOST}:${PORT}`);
    });

    let isShuttingDown = false;

    const shutdown = (signal: string): void => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(async (error) => {
        if (error) {
          console.error('Error closing HTTP server:', error);
        }

        try {
          await disconnectRedis();
          await disconnectMongoDB();

          console.log('API shutdown completed');
          process.exit(error ? 1 : 0);
        } catch (shutdownError) {
          console.error('Error during shutdown:', shutdownError);
          process.exit(1);
        }
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start API:', error);

    try {
      await disconnectRedis();
      await disconnectMongoDB();
    } catch (shutdownError) {
      console.error('Error during startup cleanup:', shutdownError);
    }

    process.exit(1);
  }
}

void startServer();
