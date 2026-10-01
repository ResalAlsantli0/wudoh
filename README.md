# Wudhoh | وضوح

An Arabic-first iOS app and Safari Web Extension that helps online shoppers understand return and exchange policies before deadlines pass.

Wudhoh detects products in a shopping cart, extracts the store policy, uses an AI policy agent to identify the applicable return and exchange windows, and keeps a simple record of the shopper's active deadlines.

> This repository is a sanitized public portfolio snapshot. It contains no production credentials or private Git history.

## What Wudhoh does

- Detects cart and checkout pages across Arabic and English storefronts.
- Extracts product information and store policy text from the page.
- Analyzes product-specific return and exchange rules with an AI agent.
- Sends results to the companion iOS app through a Safari Web Extension.
- Stores purchases locally and highlights the nearest active deadline.
- Presents an Arabic, right-to-left interface built with SwiftUI.

## Architecture

```text
Online store
    │
    ▼
Safari Web Extension (JavaScript)
    ├── detects cart products
    ├── extracts policy text
    └── requests policy analysis
              │
              ▼
FastAPI + LangGraph policy agent
              │
              ▼
Companion iOS app (SwiftUI)
    ├── stores purchase records locally
    └── tracks return and exchange deadlines
```

## Tech stack

| Layer | Technologies |
| --- | --- |
| iOS app | Swift, SwiftUI, SafariServices |
| Browser extension | JavaScript, HTML, CSS, Safari Web Extension APIs |
| Policy service | Python, FastAPI, LangGraph, OpenAI |
| Deployment | Render blueprint |

## Repository structure

```text
Wudhoh/                     SwiftUI companion app
WudhohExtension/            Safari Web Extension and native handler
WudhohAgent/                FastAPI policy-analysis service
Wudhoh.xcodeproj/           Xcode project
OpenAiService.swift         Optional direct OpenAI client
Secrets.example.plist       Safe local configuration template
```

## Getting started

### 1. Run the policy agent

```bash
cd WudhohAgent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your OpenAI API key to `WudhohAgent/.env`, then run:

```bash
python3 server.py
```

The API will be available at `http://localhost:8000`, with a health check at `/health`.

### 2. Configure the iOS project

1. Open `Wudhoh.xcodeproj` in Xcode.
2. Select your Apple Development Team for both app targets.
3. Replace the example bundle identifiers with identifiers owned by your team.
4. If you use `OpenAiService.swift`, copy `Secrets.example.plist` to `Secrets.plist` and add your key locally.
5. Keep `Secrets.plist` untracked; it is already ignored by Git.

### 3. Connect the extension

For local development, update the analysis endpoint in `WudhohExtension/Resources/background.js` to your local or hosted policy-agent URL, then build and enable the Safari extension from the companion app.

## Security notes

- Never commit `.env`, `Secrets.plist`, API keys, signing certificates, or provisioning profiles.
- The public project uses placeholder configuration only.
- For production, keep model-provider credentials on the server rather than shipping them in the app or extension.
- Review CORS and host permissions before production deployment.

## Project status

Wudhoh is a prototype and portfolio project. Storefront markup varies, so extraction logic may need adapters and additional testing for each supported merchant.

## Credits

Originally developed collaboratively by the **Wudhoh team**. This independent public snapshot is maintained by [ResalAlsantli0](https://github.com/ResalAlsantli0) for portfolio presentation, with the original private team repository and its history left unchanged.

