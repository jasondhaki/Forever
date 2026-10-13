import mongoose from 'mongoose'

// cached across invocations — serverless instances reuse the module
let connection

export const connectDB = () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set')
  connection ??= mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB ?? 'forever' }).catch((err) => {
    connection = undefined
    throw err
  })
  return connection
}
