// Content shown when Supabase isn't configured (local preview), and the source for supabase/archive.sql.
// It holds the Business Weekly issues already published on Facebook (Issues 8–11), with every figure sourced.
import archive from '@/content/archive.json';
import type { Indicator, Post } from './types';

export const demoPosts = archive.posts as Post[];
export const demoIndicators = archive.indicators as Indicator[];
