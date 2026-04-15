import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`[server] Running on port ${env.port} (${env.nodeEnv})`);
});
