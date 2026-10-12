import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

// Load environment variables for Node backend
dotenv.config();

const ALLOWED_FOLDERS = [
  'mic-and-mind/guests',
  'mic-and-mind/episodes/audio',
  'mic-and-mind/episodes/thumbnails',
  'mic-and-mind/hero/desktop',
  'mic-and-mind/hero/mobile',
  'mic-and-mind/hero/posters',
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize server-side Supabase client for token and role validation
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const supabaseServer = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon');

  // 1. Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 2. Cloudinary secure signed upload authorization endpoint
  app.post('/api/cloudinary/sign', async (req, res) => {
    try {
      // Step A: Verify Authorization Bearer Header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized: Missing or invalid Authorization header.',
        });
      }

      const token = authHeader.replace('Bearer ', '').trim();
      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized: Missing Supabase authentication token.',
        });
      }

      // Step B: Authenticate token with Supabase Auth
      const { data: userData, error: userError } = await supabaseServer.auth.getUser(token);
      if (userError || !userData?.user) {
        return res.status(401).json({
          error: 'Unauthorized: Invalid or expired Supabase user session.',
        });
      }

      // Step C: Verify admin role in public.profiles table (strict RBAC)
      const userSupabase = createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-anon',
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      const { data: profile, error: profileError } = await userSupabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden: Administrator privileges are required to generate upload signatures.',
        });
      }

      // Step D: Validate requested target folder
      const requestedFolder = typeof req.body?.folder === 'string' ? req.body.folder.trim() : '';
      const matchedFolder = ALLOWED_FOLDERS.find(
        (f) => f === requestedFolder || requestedFolder.startsWith(f)
      );
      const sanitizedFolder = matchedFolder || 'mic-and-mind/uploads';

      // Step E: Read Cloudinary credentials (API Secret stays strictly server-side)
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'hiekaatg';
      const apiKey = process.env.CLOUDINARY_API_KEY || '881146453873346';
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!apiSecret) {
        return res.status(500).json({
          error: 'Cloudinary server configuration error: CLOUDINARY_API_SECRET is not set in environment variables.',
        });
      }

      // Step F: Generate Cloudinary HMAC-SHA1 timestamped signature
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign: Record<string, any> = {
        folder: sanitizedFolder,
        timestamp: timestamp,
      };

      // Cloudinary signature convention: alphabetically sort keys, join key=val with '&', append secret, SHA-1 hash
      const sortedKeys = Object.keys(paramsToSign).sort();
      const stringToSign = sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join('&') + apiSecret;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      return res.json({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder: sanitizedFolder,
      });
    } catch (err: any) {
      console.error('Error generating Cloudinary signature:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate secure upload signature.',
      });
    }
  });

  // Vite development middleware or production static asset server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
