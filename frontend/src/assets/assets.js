import logo from './logo.png'
import hero_img from './header_img.png'
import cart_icon from './cart_icon.png'
import bin_icon from './bin_icon.png'
import dropdown_icon from './dropdown_icon.png'
import exchange_icon from './exchange_icon.png'
import profile_icon from './profile_icon.png'
import quality_icon from './quality_icon.png'
import search_icon from './search_icon.png'
import star_dull_icon from './star_dull_icon.png'
import star_icon from './star_icon.png'
import support_img from './support_img.png'
import menu_icon from './menu_icon.png'
import about_img from './about_img.png'
import contact_img from './contact_img.png'
import razorpay_logo from './razorpay_logo.png'
import stripe_logo from './stripe_logo.png'

export const assets = {
  logo, hero_img, cart_icon, bin_icon, dropdown_icon, exchange_icon, profile_icon,
  quality_icon, search_icon, star_dull_icon, star_icon, support_img, menu_icon,
  about_img, contact_img, razorpay_logo, stripe_logo,
}

const images = import.meta.glob('./p_img*.png', { eager: true, import: 'default' })

const NAMES = {
  'Women Topwear': 'Women Round Neck Cotton Top',
  'Men Topwear': 'Men Round Neck Pure Cotton T-shirt',
  'Kids Topwear': 'Kids Round Neck Cotton Top',
  'Men Bottomwear': 'Men Tapered Fit Flat-Front Trousers',
  'Women Bottomwear': 'Women Palazzo Pants with Waist Belt',
  'Kids Bottomwear': 'Kid Tapered Slim Fit Trouser',
  'Men Winterwear': 'Men Slim Fit Relaxed Denim Jacket',
  'Women Winterwear': 'Women Zip-Front Relaxed Fit Jacket',
}

// [image #, category, subCategory, price, bestseller, name override]
// ponytail: static catalogue until the backend serves products from MongoDB
const CATALOGUE = [
  [1, 'Women', 'Topwear', 100, true, 'Women Off-Shoulder Floral Top'],
  [2, 'Men', 'Topwear', 200, true, 'Men Oversized Cotton Polo T-shirt'],
  [3, 'Kids', 'Topwear', 220, true, 'Girls Floral Print Cotton Dress'],
  [4, 'Men', 'Topwear', 110, true],
  [5, 'Women', 'Topwear', 130, true],
  [6, 'Kids', 'Topwear', 140],
  [7, 'Men', 'Bottomwear', 190],
  [8, 'Men', 'Topwear', 140, false, 'Men Colour-Block Cotton Sweatshirt'],
  [9, 'Kids', 'Topwear', 100],
  [10, 'Men', 'Bottomwear', 110, false, 'Men Relaxed Fit Cargo Joggers'],
  [11, 'Men', 'Topwear', 120, true],
  [12, 'Men', 'Topwear', 150, true],
  [13, 'Women', 'Topwear', 130, true],
  [14, 'Kids', 'Topwear', 160, false, 'Boy Short Sleeve Cotton Shirt'],
  [15, 'Men', 'Bottomwear', 140],
  [16, 'Kids', 'Topwear', 170],
  [17, 'Men', 'Bottomwear', 150, false, 'Men Slim Fit Track Pants'],
  [18, 'Kids', 'Topwear', 180, false, 'Boy Round Neck Pure Cotton T-shirt'],
  [19, 'Kids', 'Topwear', 160, false, 'Boy Round Neck Pure Cotton T-shirt'],
  [20, 'Women', 'Bottomwear', 190],
  [21, 'Women', 'Winterwear', 200],
  [22, 'Women', 'Bottomwear', 210, false, 'Women Wide Leg High-Rise Trousers'],
  [23, 'Kids', 'Topwear', 200, false, 'Boy Sleeveless Printed Vest'],
  [24, 'Kids', 'Topwear', 180, false, 'Boy Striped Cotton Shirt'],
  [25, 'Kids', 'Topwear', 210],
  [26, 'Women', 'Winterwear', 220, false, 'Women Cropped Denim Jacket'],
  [27, 'Kids', 'Topwear', 230, false, 'Girls Floral Print Cotton Dress'],
  [28, 'Men', 'Winterwear', 240, false, 'Men Quilted Puffer Jacket'],
  [29, 'Women', 'Topwear', 280],
  [30, 'Kids', 'Topwear', 210],
  [31, 'Men', 'Topwear', 220],
  [32, 'Men', 'Topwear', 230, false, 'Men Colour-Block Cotton Sweatshirt'],
  [33, 'Kids', 'Topwear', 240],
  [34, 'Women', 'Topwear', 250, false, 'Women V-Neck Cotton Top'],
  [35, 'Women', 'Winterwear', 260, false, 'Women Zip-Front Track Jacket'],
  [36, 'Women', 'Winterwear', 270],
  [37, 'Women', 'Topwear', 280],
  [38, 'Kids', 'Topwear', 290, false, 'Boy Short Sleeve Cotton Shirt'],
  [39, 'Men', 'Topwear', 300, false, 'Men Printed Plain Cotton Shirt'],
  [40, 'Men', 'Winterwear', 310, false, 'Men Sleeveless Zip-Front Gilet'],
  [41, 'Men', 'Topwear', 320],
  [42, 'Kids', 'Topwear', 330, false, 'Boy Round Neck Pure Cotton T-shirt'],
  [43, 'Kids', 'Bottomwear', 340],
  [44, 'Women', 'Winterwear', 350],
  [45, 'Men', 'Winterwear', 360, false, 'Men Hooded Puffer Jacket'],
  [46, 'Men', 'Winterwear', 370],
  [47, 'Kids', 'Bottomwear', 380],
  [48, 'Men', 'Winterwear', 390],
  [49, 'Kids', 'Bottomwear', 400],
  [50, 'Kids', 'Bottomwear', 410],
  [51, 'Women', 'Winterwear', 420],
  [52, 'Men', 'Winterwear', 430],
]

const SIZES = {
  Kids: ['S', 'M', 'L'],
  Bottomwear: ['S', 'M', 'L', 'XL'],
  default: ['S', 'M', 'L', 'XL', 'XXL'],
}

const NOW = Date.UTC(2024, 4, 25)

export const products = CATALOGUE.map(([n, category, subCategory, price, bestseller = false, name]) => ({
  _id: `p${n}`,
  name: name ?? NAMES[`${category} ${subCategory}`],
  description:
    'A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.',
  price,
  image: [images[`./p_img${n}.png`]],
  category,
  subCategory,
  sizes: SIZES[category === 'Kids' ? 'Kids' : subCategory] ?? SIZES.default,
  date: NOW - n * 86400000,
  bestseller,
}))
