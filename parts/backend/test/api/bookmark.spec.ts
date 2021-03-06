import Bookmark from '@be/src/services/bookmark/model';
import SpacedRepetition from '@be/src/services/spaced-repetition';
import * as assert from 'power-assert'
import * as request from 'supertest'
import createServer, { app } from './server.helper';
const server = createServer()

describe('API: bookmarks', () => {
  const db = app.DB
  before(async () => {
    await Bookmark.newQuery().truncate()
    await SpacedRepetition.newQuery().truncate()
    await db.table('bookmark_tag').truncate()
  })

  describe('/api/bookmarks', () => {
    it('get:', async () => {
      const res = await request(server).get('/api/bookmarks')
      assert(res.status === 200)
      assert(res.text === '[]')
    })

    it('post: 422', async () => {
      const res = await request(server)
        .post('/api/bookmarks')
        .send('name=test&url=test')
      assert(res.status === 422)
    })

    it('post: 200', async () => {
      const res = await request(server)
        .post('/api/bookmarks')
        .send({
          name: 'baidu',
          url: 'http://www.baidu.com',
        })
      assert(res.status === 200)
    })

    it('post: with repeat and tag_id', async () => {
      const res = await request(server)
        .post('/api/bookmarks')
        .send({
          name: 'zhihu',
          url: 'http://www.zhihu.com',
          tag_id: 1,
          repeat: 1,
        })
      assert(res.status === 200)
      const srs = await SpacedRepetition.all()
      assert(srs.length === 5)

      const bts = await db.table('bookmark_tag').select()
      assert(bts.length === 1)
      assert(bts[0].tag_id === 1)
    })
  })
})
