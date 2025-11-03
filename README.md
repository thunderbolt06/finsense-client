# FinSense - Financial Research Copilot

A minimal React chat interface for the FinSense hackathon project. This frontend provides a simple chat UI with hardcoded responses and a placeholder for API integration.

## Features

- Simple chat interface with message list and composer
- Auto-resizing textarea input
- Hardcoded responses for testing (with commented placeholder for real API)
- Clean, minimal UI with Tailwind CSS
- TypeScript for type safety

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure backend API URL (optional):
   - Copy `.env.example` to `.env`
   - Update `VITE_API_BASE_URL` if your backend runs on a different port
   - Default is `http://localhost:8000`
   - Or edit `src/config/api.ts` directly to change the base URL

3. Start development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## API Configuration

The backend API URL is configurable in two ways:

1. **Environment Variable** (recommended):
   - Create a `.env` file with `VITE_API_BASE_URL=http://localhost:8000`
   - This allows different configs for different environments

2. **Config File** (direct):
   - Edit `src/config/api.ts` and change the `BASE_URL` property
   - Default: `http://localhost:8000`

The API endpoints are:
- `/api/query` - POST request for chat queries (streaming SSE)
- `/api/traces` - GET request for chat history

## Project Structure

```
finsense/
├── src/
│   ├── components/
│   │   ├── ChatComposer.tsx    # Chat input with textarea and send button
│   │   ├── MessageList.tsx     # Container for displaying messages
│   │   └── Message.tsx         # Individual message component
│   ├── api/
│   │   └── query.ts            # API client with hardcoded responses
│   ├── App.tsx                 # Main chat interface
│   └── main.tsx                # React entry point
```

## API Integration

The API client is set up in `src/api/query.ts` with hardcoded responses. To integrate with your backend:

1. Uncomment the fetch API code in `sendQuery()` function
2. Update the endpoint URL if needed
3. Adjust request/response types if your API uses different formats

Current implementation returns hardcoded responses based on message keywords (hello, price, analysis, etc.).

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

- cd /Users/thunderbolt/Documents/projects/FinSense/finsense-client/finsense && npm run dev 2>&1 &  