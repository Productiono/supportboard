import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname));

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Web client demo running on port ${port}`);
});
