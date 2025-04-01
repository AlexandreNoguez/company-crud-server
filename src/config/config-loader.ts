import * as Joi from 'joi';

export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.POSTGRES_DB,
    logging: process.env.POSTGRES_LOGGING === 'true',
  },
  notifyEmails: process.env.NOTIFY_EMAILS,
  sentry: {
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE ?? '1.0',
    ),
    profilesSampleRate: parseFloat(
      process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '1.0',
    ),
  },
});

export const validationSchema: any = Joi.object({
  PORT: Joi.string().default(3000),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.string().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_LOGGING: Joi.string().valid('true', 'false').default('false'),
  NOTIFY_EMAILS: Joi.string().required(),
  SENTRY_DSN: Joi.string().uri().required(),
  SENTRY_TRACES_SAMPLE_RATE: Joi.string().min(0).max(1).default(1.0),
  SENTRY_PROFILES_SAMPLE_RATE: Joi.string().min(0).max(1).default(1.0),
});
