# Environment Setup

## Frontend Environment Variables

Create a `.env` file in the `pmj-frontend` directory with the following content:

```env
VITE_API_URL=http://localhost:5000/api
```

### Environment Variables Explanation

- `VITE_API_URL`: The base URL for the backend API. Change this to your production API URL when deploying.

## Development

For development, the default configuration connects to:

- Frontend: `http://localhost:5173` (Vite default)
- Backend: `http://localhost:5000`

## Production

For production deployment, update the `VITE_API_URL` to point to your production backend URL:

```env
VITE_API_URL=https://your-production-api.com/api
```

## Note

- Environment variables in Vite must be prefixed with `VITE_` to be exposed to the client
- After changing environment variables, restart the development server
