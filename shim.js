// Node.js polyfills for React Native (required for Supabase realtime)
import { Buffer } from 'buffer';
import process from 'process';

global.Buffer = Buffer;
global.process = process;

if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = setTimeout;
}
