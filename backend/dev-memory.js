// Local dev without MongoDB installed: in-memory database, seeded, on :4000. Data resets on exit.
import { MongoMemoryServer } from 'mongodb-memory-server'
const mongo = await MongoMemoryServer.create()
Object.assign(process.env, { MONGODB_URI: mongo.getUri(), JWT_SECRET: 'dev-secret', ADMIN_EMAIL: 'admin@forever.com', ADMIN_PASSWORD: 'admin-pass-123' })
const { default: app } = await import('./server.js')
const { connectDB } = await import('./db.js')
const { seed } = await import('./seed.js')
await connectDB(); await seed()
app.listen(4000, () => console.log('API on http://localhost:4000 (in-memory MongoDB, admin@forever.com / admin-pass-123)'))
