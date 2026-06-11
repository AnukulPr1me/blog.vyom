import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Category ─────────────────────────────────────────────────────────────────
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
  showInNav: boolean;
  showInFooter: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    showInNav: { type: Boolean, default: true },
    showInFooter: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Author ───────────────────────────────────────────────────────────────────
export interface IAuthor extends Document {
  name: string;
  slug: string;
  email?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: { twitter?: string; linkedin?: string; github?: string; website?: string };
  isActive: boolean;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: String,
    avatar: String,
    bio: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
      website: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Tag ──────────────────────────────────────────────────────────────────────
export interface ITag extends Document {
  name: string;
  slug: string;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

// ─── Article ──────────────────────────────────────────────────────────────────
export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  content: string;
  category?: Types.ObjectId;
  author?: Types.ObjectId;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords: string[];
  canonicalUrl?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: Date;
  publishedAt?: Date;
  viewCount: number;
  readingTime: number;
  revisions: mongoose.Types.DocumentArray<any>;
}

// Use mongoose.Schema.Types.Mixed correctly — NOT in an array wrapper
const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: String,
    featuredImage: String,
    content: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    author: { type: Schema.Types.ObjectId, ref: 'Author' },
    tags: [String],
    metaTitle: String,
    metaDescription: String,
    seoKeywords: [String],
    canonicalUrl: String,
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
    scheduledAt: Date,
    publishedAt: Date,
    viewCount: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 },
    // Use Mixed directly (not wrapped in []) to avoid TS type conflict
    revisions: { type: Schema.Types.Mixed, default: [], select: false },
  },
  { timestamps: true }
);

ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1, status: 1 });
ArticleSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

// ─── Newsletter ───────────────────────────────────────────────────────────────
export interface ISubscriber extends Document {
  email: string;
  isActive: boolean;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Contact ──────────────────────────────────────────────────────────────────
export interface IContact extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
}

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  },
  { timestamps: true }
);

// ─── Setting ──────────────────────────────────────────────────────────────────
export interface ISetting extends Document {
  key: string;
  value: any;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// ─── Export models (safe for Next.js hot-reload) ──────────────────────────────
export const User = (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);
export const Category = (mongoose.models.Category as mongoose.Model<ICategory>) ||
  mongoose.model<ICategory>('Category', CategorySchema);
export const Author = (mongoose.models.Author as mongoose.Model<IAuthor>) ||
  mongoose.model<IAuthor>('Author', AuthorSchema);
export const Tag = (mongoose.models.Tag as mongoose.Model<ITag>) ||
  mongoose.model<ITag>('Tag', TagSchema);
export const Article = (mongoose.models.Article as mongoose.Model<any>) ||
  mongoose.model('Article', ArticleSchema);
export const Subscriber = (mongoose.models.Subscriber as mongoose.Model<ISubscriber>) ||
  mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
export const Contact = (mongoose.models.Contact as mongoose.Model<IContact>) ||
  mongoose.model<IContact>('Contact', ContactSchema);
export const Setting = (mongoose.models.Setting as mongoose.Model<ISetting>) ||
  mongoose.model<ISetting>('Setting', SettingSchema);
