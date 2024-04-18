import { Router } from 'express';

const indexRouter = Router().get('/', (req, res) => {
  const data = { title: 'hello sirus!' };
  res.render('index', data);
});

const apiRouter = Router({
  mergeParams: true,
}).get('/v1', (req, res) => {
  res.status(200).json({
    data: 'hello sirus api!',
  });
}).get('/list', (req, res) => {
  res.status(200).json({
    data: '11111',
  });
});

export default [{
  prefix: '/',
  router: indexRouter
}, {
  prefix: '/v1',
  router: apiRouter
}];
