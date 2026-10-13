import { Router } from 'express'
import { handleUpload } from '@vercel/blob/client'
import { adminAuth } from '../auth.js'

const router = Router()

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

// Issues a short-lived token so the admin's browser uploads straight to Vercel Blob
// (bypasses the 4.5 MB function body limit). No completion callback is used — the
// returned URL is saved with the product.
router.post('/', adminAuth, async (req, res) => {
  if (!blobConfigured()) return res.status(503).json({ error: 'Image uploads are not configured (BLOB_READ_WRITE_TOKEN)' })
  if (req.body?.type !== 'blob.generate-client-token') return res.status(400).json({ error: 'Unsupported request' })

  try {
    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('products/')) throw new Error('Invalid upload path')
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
    })
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
