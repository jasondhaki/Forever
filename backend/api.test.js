// End-to-end API check against an in-memory MongoDB. Run: npm test
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongo, server, base

before(async () => {
  mongo = await MongoMemoryServer.create()
  Object.assign(process.env, {
    MONGODB_URI: mongo.getUri(),
    JWT_SECRET: 'test-secret',
    ADMIN_EMAIL: 'admin@forever.com',
    ADMIN_PASSWORD: 'admin-pass-123',
  })
  const { default: app } = await import('./server.js')
  const { connectDB } = await import('./db.js')
  const { seed } = await import('./seed.js')
  await connectDB()
  await seed()
  server = app.listen(0)
  base = `http://localhost:${server.address().port}/api`
})

after(async () => {
  server?.close()
  await mongoose.disconnect()
  await mongo?.stop()
})

const call = async (path, { body, token, method = body ? 'POST' : 'GET' } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  })
  return { status: res.status, ...(await res.json()) }
}

const address = {
  firstName: 'Jane', lastName: 'Doe', email: 'jane@x.com', street: '1 Main', city: 'NYC',
  state: 'NY', zipcode: '10001', country: 'USA', phone: '5551234',
}

test('shopping flow', async () => {
  const { products } = await call('/product/list')
  assert.equal(products.length, 52)
  const p = products[0]

  // auth
  assert.equal((await call('/user/register', { body: { name: 'J', email: 'bad', password: 'x' } })).status, 400)
  const reg = await call('/user/register', { body: { name: 'Jane', email: 'Jane@X.com', password: 'secret123' } })
  assert.equal(reg.status, 201)
  assert.equal((await call('/user/register', { body: { name: 'J', email: 'jane@x.com', password: 'secret123' } })).status, 409)
  assert.equal((await call('/user/login', { body: { email: 'jane@x.com', password: 'wrong-pass' } })).status, 401)
  const { token } = await call('/user/login', { body: { email: 'jane@x.com', password: 'secret123' } })
  assert.ok(token)

  // cart
  assert.equal((await call('/cart')).status, 401)
  const cartData = { [p._id]: { [p.sizes[0]]: 2 } }
  assert.equal((await call('/cart', { method: 'PUT', token, body: { cartData } })).success, true)
  assert.deepEqual((await call('/cart', { token })).cartData, cartData)
  assert.equal((await call('/cart', { method: 'PUT', token, body: { cartData: { [p._id]: { M: -1 } } } })).status, 400)

  // order is priced server-side; client price fields are ignored
  const items = [{ productId: p._id, size: p.sizes[0], quantity: 2, price: 0.01 }]
  assert.equal((await call('/order/place', { token, body: { items: [{ ...items[0], size: 'XXXL' }], address } })).status, 400)
  assert.equal((await call('/order/place', { token, body: { items, address: { ...address, city: '' } } })).status, 400)
  const placed = await call('/order/place', { token, body: { items, address } })
  assert.equal(placed.status, 201)
  const { orders } = await call('/order/user', { token })
  assert.equal(orders.length, 1)
  assert.equal(orders[0].amount, p.price * 2 + 10)
  assert.deepEqual((await call('/cart', { token })).cartData, {}, 'cart cleared after order')

  // payments without keys report not configured
  assert.equal((await call('/order/stripe', { token, body: { items, address } })).status, 503)

  // admin
  assert.equal((await call('/order/list', { token })).status, 401, 'user token is not admin')
  assert.equal((await call('/user/admin', { body: { email: 'admin@forever.com', password: 'nope' } })).status, 401)
  const admin = (await call('/user/admin', { body: { email: 'admin@forever.com', password: 'admin-pass-123' } })).token
  assert.equal((await call('/order/list', { token: admin })).orders.length, 1)
  assert.equal((await call('/order/status', { token: admin, body: { orderId: placed.orderId, status: 'Bogus' } })).status, 400)
  assert.equal((await call('/order/status', { token: admin, body: { orderId: placed.orderId, status: 'Shipped' } })).success, true)
  assert.equal((await call('/order/user', { token })).orders[0].status, 'Shipped')

  // image upload token endpoint
  const blobBody = (pathname) => ({ type: 'blob.generate-client-token', payload: { pathname, callbackUrl: '', clientPayload: null, multipart: false } })
  assert.equal((await call('/upload', { token, body: blobBody('products/a.png') })).status, 401, 'users cannot upload')
  assert.equal((await call('/upload', { token: admin, body: blobBody('products/a.png') })).status, 503, 'not configured without token')
  process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_teststore_secret123'
  const up = await call('/upload', { token: admin, body: blobBody('products/a.png') })
  assert.equal(up.type, 'blob.generate-client-token')
  assert.ok(up.clientToken?.startsWith('vercel_blob_client_'))
  assert.equal((await call('/upload', { token: admin, body: blobBody('evil/a.png') })).status, 400, 'path restricted')
  delete process.env.BLOB_READ_WRITE_TOKEN

  const added = await call('/product/add', {
    token: admin,
    body: { name: 'Test Tee', description: 'd', price: 50, image: ['/products/p_img1.png'], category: 'Men', subCategory: 'Topwear', sizes: ['M'] },
  })
  assert.equal(added.status, 201)
  assert.equal((await call('/product/add', { token: admin, body: { name: 'x' } })).status, 400)
  const bad = { name: 'x', description: 'd', price: 5, category: 'Men', subCategory: 'Topwear', sizes: ['M'] }
  for (const image of [[], ['javascript:alert(1)'], ['//evil.com/x.png']]) {
    assert.equal((await call('/product/add', { token: admin, body: { ...bad, image } })).status, 400, `rejects ${image}`)
  }
  assert.equal((await call('/product/remove', { token: admin, body: { id: added.product._id } })).success, true)
  assert.equal((await call(`/product/${added.product._id}`)).status, 404)
})
