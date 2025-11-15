import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const result = dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Dotenv result:', result.parsed ? 'Parsed successfully' : 'Failed to parse');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Not loaded');
if (process.env.MONGO_URI) {
  console.log('MONGO_URI length:', process.env.MONGO_URI.length);
}