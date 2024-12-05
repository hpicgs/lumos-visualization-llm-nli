# lumos-visualization-llm-nli
Lumos: Enhancing Data Visualizations with LLM-based Natural Language Interfaces

# Setup
## Prerequisites
You will need Docker (Docker Engine & Docker Compose) and an OpenAI API key.
## Setup Steps
1. Create a .env file containing the OpenAI API key stored in the variable `OPENAI_API_KEY`
2. Open terminal or powershell
3. Build container
    1. Windows: `docker-compose build`
    2. Linux: `docker compose build`
4. Run system
    1. Windows: `docker-compose up`
    2. Linux: `docker compose up`
5. Import
6. [Open Frontend](http://localhost:5173)

# Notes
When you interact with the chat, the message thread is persisted in the OpenAI backend, but not yet in the Lumos system. This means if you re-open the frontend, there is a blank chat window. But behind the scenes there is still your old messages on OpenAI. So the LLM might return confusing information, like control information containing a different color scheme from a previous session.
For a fresh thread, you need to remove the LLM and the related prompt via API calls.