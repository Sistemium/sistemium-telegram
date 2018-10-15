import store, { authorize } from '../src/jsdata/store';
import log from '../src/services/log';

import Article from './models/Article';
import ArticleGroup from './models/ArticleGroup';
import ArticlePicture from './models/ArticlePicture';

// eslint-disable-next-line
const { debug } = log('test:jsdata');

beforeAll(() => {
  jest.setTimeout(50000);
  authorize(process.env.ACCESS_TOKEN, process.env.ORG);
});

afterEach(() => {
  store.clear();
});


test('find all article limit 10 with relations', async () => {

  const articles = await Article.findAll({
    limit: 10,
  }, {
    with: [
      'parent',
      'avatarPicture',
    ],
    force: true,
  });

  expect(articles.length)
    .not
    .toBe(0);

  expect(articles[0].parent)
    .not
    .toBeUndefined();

  expect(articles[0].avatarPicture)
    .not
    .toBeUndefined();

});

test('fetch all article fetch size 100', async () => {

  const articles = await Article.fetchAll({
    limit: 100,
  });

  expect(articles.length)
    .not
    .toBe(0);

});

test('fetch all article fetch size 500', async () => {

  const articles = await Article.fetchAll({
    limit: 500,
  });

  expect(articles.length)
    .not
    .toBe(0);

});


test('fetch all article fetch size 1000', async () => {

  const articles = await Article.fetchAll({
    limit: 1000,
  });

  expect(articles.length)
    .not
    .toBe(0);

});

test('find all article, articleGroup, articlePicture', async () => {

  const limit = 20000;
  const name = 'findAll';

  console.log(name, 'start');

  await ArticleGroup.findAll({
    limit,
  });

  await ArticlePicture.findAll({
    limit,
  });

  await Article.findAll({
    limit,
  });

});

test('fetch all article, articleGroup, articlePicture fetch size 1000', async () => {

  await ArticleGroup.fetchAll({
    limit: 1000,
  });

  console.log('done ArticleGroup');

  await ArticlePicture.fetchAll({
    limit: 1000,
  });

  console.log('done ArticlePicture');

  await Article.fetchAll({
    limit: 1000,
  });

  console.log('done Article');

});

test('fetch all article, articleGroup, articlePicture fetch size 500', async () => {

  await ArticleGroup.fetchAll({
    limit: 500,
  });

  await ArticlePicture.fetchAll({
    limit: 500,
  });

  await Article.fetchAll({
    limit: 500,
  });

});

test('fetch all article, articleGroup, articlePicture fetch size 100', async () => {

  await ArticleGroup.fetchAll({
    limit: 100,
  });

  await ArticlePicture.fetchAll({
    limit: 100,
  });

  await Article.fetchAll({
    limit: 100,
  });

});
