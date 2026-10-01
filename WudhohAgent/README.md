# Wudhoh Agent

FastAPI service that extracts return and exchange windows for the Wudhoh Safari Web Extension.

## Local development

1. Create and activate a Python virtual environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
4. Run `python3 server.py`.

## Render

The repository includes `render.yaml`. Create a Render Blueprint from this repository and enter `OPENAI_API_KEY` in the Render dashboard when prompted. Never commit `.env` or an API key.
