const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa2-cors');
const koaBody = require('koa-body');

const app = new Koa();

app.use(cors());
app.use(koaBody({ json: true }));

let posts = [
];
let nextId = 1;

const router = new Router();

router.get('/posts', async (ctx, next) => {
  ctx.response.body = posts;
});

router.post('/posts', async (ctx, next) => {
  const { id, content } = JSON.parse(ctx.request.body);

  if (posts.some((post) => post.id == id)) {
    posts = posts.map((o) => (o.id !== id ? o : { ...o, content: content }));
    ctx.response.status = 200;
    ctx.response.body = posts;

    return;
  }

  posts.push({
    ...JSON.parse(ctx.request.body),
    id: nextId++,
    created: Date.now(),
  });
  ctx.response.status = 200;
 ctx.response.body = posts;
});

router.delete('/posts/:id', async (ctx, next) => {
  const postId = Number(ctx.params.id.replace(/:/, ''));
  const index = posts.findIndex((o) => o.id === postId);
  if (index !== -1) {
    posts.splice(index, 1);
  }
  ctx.response.status = 200;
  ctx.response.body = posts;
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7777;
const server = http.createServer(app.callback());
server.listen(port, () => console.log('server started'));
