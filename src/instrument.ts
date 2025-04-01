import * as dotenv from 'dotenv';
dotenv.config();
import * as Sentry from '@sentry/nestjs';

console.log('SENTRY_DSN', process.env.SENTRY_DSN);

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  profileSessionSampleRate: 1.0,
});
