import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // { [productId]: { [size]: quantity } }
    cartData: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true },
)

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: {
      type: [String],
      validate: {
        validator: (v) => v.length > 0 && v.length <= 4 && v.every((u) => /^(https?:\/\/|\/(?!\/))\S+$/.test(u)),
        message: 'Provide 1-4 image URLs (https://... or /path)',
      },
    },
    category: { type: String, required: true, enum: ['Men', 'Women', 'Kids'] },
    subCategory: { type: String, required: true, enum: ['Topwear', 'Bottomwear', 'Winterwear'] },
    sizes: { type: [String], required: true },
    bestseller: { type: Boolean, default: false },
    date: { type: Number, default: Date.now },
  },
)

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        _id: false,
        productId: { type: String, required: true },
        name: String,
        price: Number,
        image: String,
        size: String,
        quantity: Number,
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: 'Order Placed' },
    paymentMethod: { type: String, required: true, enum: ['cod', 'stripe', 'razorpay'] },
    payment: { type: Boolean, default: false },
    paymentRef: String,
    date: { type: Number, default: Date.now },
  },
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema)
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)
