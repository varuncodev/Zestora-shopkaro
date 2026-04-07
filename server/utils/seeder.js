const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User    = require('./models/User');
const Product = require('./models/Product');
const Order   = require('./models/Order');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding');
};

const users = [
  { name: 'Admin User',   email: 'admin@shop.com', password: 'password123', role: 'admin' },
  { name: 'Rahul Sharma', email: 'rahul@test.com',  password: 'password123', role: 'user' },
  { name: 'Priya Singh',  email: 'priya@test.com',  password: 'password123', role: 'user' },
];

const products = [
  { name: 'Apple iPhone 15',          price: 79999, category: 'Electronics', brand: 'Apple',    stock: 50, rating: 4.5, numReviews: 12, description: 'Latest iPhone with A16 Bionic chip, 48MP camera, USB-C.', images: [{ url: 'https://via.placeholder.com/800x800?text=iPhone+15', public_id: 'iphone15' }], featured: true },
  { name: 'Samsung Galaxy S24',        price: 69999, category: 'Electronics', brand: 'Samsung',  stock: 35, rating: 4.3, numReviews: 8,  description: 'Galaxy AI features, 200MP camera, 12GB RAM.', images: [{ url: 'https://via.placeholder.com/800x800?text=Galaxy+S24', public_id: 'galaxys24' }] },
  { name: 'Sony WH-1000XM5 Headphones',price: 29999, category: 'Electronics', brand: 'Sony',     stock: 20, rating: 4.8, numReviews: 25, description: 'Industry-leading noise cancellation, 30hr battery.', images: [{ url: 'https://via.placeholder.com/800x800?text=Sony+WH1000XM5', public_id: 'sonywh' }], featured: true },
  { name: 'Nike Air Max 270',           price: 10999, category: 'Clothing',    brand: 'Nike',     stock: 60, rating: 4.4, numReviews: 30, description: 'Comfortable everyday sneakers with Air cushioning.', images: [{ url: 'https://via.placeholder.com/800x800?text=Nike+Air+Max', public_id: 'nikeair' }] },
  { name: 'MacBook Air M2',             price: 114999,category: 'Electronics', brand: 'Apple',    stock: 15, rating: 4.9, numReviews: 18, description: '13.6-inch Liquid Retina, M2 chip, 18hr battery.', images: [{ url: 'https://via.placeholder.com/800x800?text=MacBook+Air+M2', public_id: 'macbookm2' }], featured: true },
  { name: 'Atomic Habits (Book)',       price: 399,   category: 'Books',       brand: 'Penguin',  stock: 200,rating: 4.7, numReviews: 55, description: 'James Clear\'s bestselling guide to building good habits.', images: [{ url: 'https://via.placeholder.com/800x800?text=Atomic+Habits', public_id: 'atomichabits' }] },
  { name: 'Levi\'s 511 Slim Jeans',     price: 3999,  category: 'Clothing',    brand: 'Levis',    stock: 80, rating: 4.2, numReviews: 20, description: 'Classic slim fit jeans, 99% cotton, multiple colors.', images: [{ url: 'https://via.placeholder.com/800x800?text=Levis+511', public_id: 'levis511' }] },
  { name: 'Instant Pot Duo 7-in-1',    price: 8999,  category: 'Home',        brand: 'InstantPot',stock: 25,rating: 4.6, numReviews: 14, description: 'Pressure cooker, slow cooker, rice cooker and more.', images: [{ url: 'https://via.placeholder.com/800x800?text=Instant+Pot', public_id: 'instantpot' }] },
  { name: 'Yoga Mat Premium',           price: 1299,  category: 'Sports',      brand: 'Decathlon',stock: 100,rating: 4.3, numReviews: 40, description: '6mm thick non-slip yoga mat with carry strap.', images: [{ url: 'https://via.placeholder.com/800x800?text=Yoga+Mat', public_id: 'yogamat' }] },
  { name: 'boAt Airdopes 141',          price: 1299,  category: 'Electronics', brand: 'boAt',     stock: 150,rating: 4.1, numReviews: 60, description: 'True wireless earbuds, 42hr battery, IPX4 water resistant.', images: [{ url: 'https://via.placeholder.com/800x800?text=boAt+Airdopes', public_id: 'boatairdopes' }] },
];

const importData = async () => {
  await connectDB();
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    const hashedUsers = await Promise.all(users.map(async u => ({
      ...u, password: await bcrypt.hash(u.password, 12),
    })));

    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser    = createdUsers[0]._id;
    const seedProducts = products.map(p => ({ ...p, createdBy: adminUser }));

    await Product.insertMany(seedProducts);

    console.log('✅ Data seeded successfully!');
    console.log('Admin:  admin@shop.com / password123');
    console.log('User 1: rahul@test.com / password123');
    console.log('User 2: priya@test.com / password123');
    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('✅ All data destroyed');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') destroyData();
else importData();
