import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api',
  });
});

app.listen(PORT, () => {
  console.log(`API service listening on port ${PORT}`);
});
