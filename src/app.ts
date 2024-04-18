import path from 'path';
import express from 'express';

import routes from './routes';
import { useSocket } from './routes/socket';

const app = express();
const port = process.env.PORT || 3001;

app.set('views', path.resolve('src', 'views'));
app.set('view engine', 'ejs');

routes.forEach((routeConfig) => {
  app.use(routeConfig.prefix, routeConfig.router);
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
useSocket(server);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
