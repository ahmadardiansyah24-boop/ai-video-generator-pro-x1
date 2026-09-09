# AI Video Generator PRO X1

Production-oriented Next.js AI video studio by Ahmad Yurid Ardiansah, S.Pd.

## Features
- Responsive dark-premium studio
- Text-to-video + storyboard
- Multi-scene planning
- 9:16 / 16:9 / 1:1
- 720p / 1080p / 4K selector
- Veo 3.1 server-side adapter
- Hugging Face provider adapter
- AUTO fallback to DEMO
- Identity/character bible
- Status polling
- Demo MP4

## Local
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Vercel
Import the repository/project into Vercel, use the default Next.js settings, and add:
`GEMINI_API_KEY`, `VEO_MODEL`, `HF_TOKEN`, `HF_MODEL` as server environment variables.
Never put secrets in `NEXT_PUBLIC_*`.

## Production architecture
For long multi-scene renders, use a job queue + object storage + background worker rather than holding a browser request open.
