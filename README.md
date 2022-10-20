## Running locally

In the project directory, run to install dependencies:

### `yarn`

then

### `yarn dev`

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Enabling Sentry

To enable tracing and error reporting to Sentry, these environment variables must be present during build time:

- `VITE_SENTRY_DSN` - The Data Source Name to determine where browser should send events
- `SENTRY_AUTH_TOKEN` - The authentication token to use with Sentry, obtained from https://sentry.io/settings/account/api/auth-tokens/.
  - Following scoped are required: `project:releases` and `org:read`
- `SENTRY_PROJECT` - The slug of Sentry project
- `SENTRY_ORG` - The slug of Sentry organization
- `SENTRY_URL` - The base URL of your Sentry instance, defaults to `https://sentry.io/`
