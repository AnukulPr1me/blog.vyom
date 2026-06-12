#!/usr/bin/env tsx
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vyom.quest';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

if (!MONGODB_URI) {
  console.error('\n❌  MONGODB_URI is not set. Create a .env file first.\n');
  process.exit(1);
}

// Inline schemas (no Next.js import needed here)
const UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true, lowercase: true }, password: String, role: { type: String, default: 'admin' }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const CategorySchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, description: String, isActive: { type: Boolean, default: true }, order: Number, showInNav: { type: Boolean, default: true }, showInFooter: { type: Boolean, default: true } }, { timestamps: true });
const AuthorSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, email: String, avatar: String, bio: String, socialLinks: Object, isActive: { type: Boolean, default: true } }, { timestamps: true });
const SettingSchema = new mongoose.Schema({ key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed }, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Category = mongoose.model('Category', CategorySchema);
const Author = mongoose.model('Author', AuthorSchema);
const Setting = mongoose.model('Setting', SettingSchema);

async function seed() {
  console.log('\n🌱  Vyom – running seed script...\n');
  await mongoose.connect(MONGODB_URI!);
  console.log('✅  Connected to MongoDB\n');

  // Admin user
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`⚠️   Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'admin', isActive: true });
    console.log(`✅  Admin created: ${ADMIN_EMAIL}`);
  }

  // Default categories
  const cats = [
    { name: 'Smartphones', slug: 'smartphones', description: 'Latest smartphone news and reviews', order: 1 },
    { name: 'Laptops', slug: 'laptops', description: 'Laptop reviews, guides, and comparisons', order: 2 },
    { name: 'News', slug: 'news', description: 'Breaking tech news', order: 3 },
    { name: 'Reviews', slug: 'reviews', description: 'In-depth product reviews', order: 4 },
    { name: 'AI', slug: 'ai', description: 'Artificial Intelligence news and insights', order: 5 },
    { name: 'Software', slug: 'software', description: 'Software reviews and tutorials', order: 6 },
  ];
  for (const cat of cats) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) { await Category.create(cat); console.log(`✅  Category: ${cat.name}`); }
    else console.log(`⚠️   Category exists: ${cat.name}`);
  }

  // Default author
  const existingAuthor = await Author.findOne({ slug: 'admin' });
  if (!existingAuthor) {
    await Author.create({ name: ADMIN_NAME, slug: 'admin', email: ADMIN_EMAIL, bio: 'Tech enthusiast and writer at Vyom.', socialLinks: {}, isActive: true });
    console.log(`✅  Default author created`);
  }

  // Default settings
  const defaults: Record<string, any> = {
    siteName: 'Vyom', siteTagline: 'Your Tech Universe',
    siteUrl: 'https://vyom.quest', siteEmail: 'hi.kio2002@gmail.com',
    metaDescription: 'Vyom is your go-to source for tech news, smartphone reviews, laptop guides, and AI insights.',
    socialLinks: { twitter: '', facebook: '', instagram: '', youtube: '' },
    googleAnalyticsId: '', adsensePublisherId: '',
  };
  for (const [key, value] of Object.entries(defaults)) {
    await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
  }
  console.log(`✅  Default settings saved\n`);

  console.log('🎉  Seed complete!\n');
  console.log('─────────────────────────────');
  console.log(`  Admin Email:    ${ADMIN_EMAIL}`);
  console.log(`  Admin Password: ${ADMIN_PASSWORD}`);
  console.log('─────────────────────────────');
  console.log('  ⚠️  Change your password after first login!\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
