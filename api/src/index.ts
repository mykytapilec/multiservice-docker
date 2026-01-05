import express from 'express';

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

app.listen(PORT, HOST, () => {
  console.log(`API service listening on ${HOST}:${PORT}`);
});
