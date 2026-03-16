# CLAUDE.md — AI Assistant Guide for document-qa

## Project Overview

A minimal single-file Streamlit web application that enables document question-answering via the OpenAI GPT-3.5-turbo API. Users upload a `.txt` or `.md` file, ask a question, and receive a streamed GPT response.

**Deployment target:** Streamlit Community Cloud
**Live demo:** https://document-question-answering-template.streamlit.app/

---

## Repository Structure

```
document-qa/
├── streamlit_app.py        # Entire application — single source file
├── requirements.txt        # Python dependencies (streamlit, openai)
├── README.md               # Setup and run instructions
├── .devcontainer/
│   └── devcontainer.json   # Dev container config (Python 3.11, port 8501)
├── .github/
│   └── CODEOWNERS          # Owned by @streamlit/community-cloud
├── .gitignore              # Excludes .streamlit/secrets.toml and standard Python artifacts
└── LICENSE
```

**Key rule:** This is intentionally a single-file app. Do not split logic into multiple modules unless explicitly asked.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.11 |
| UI Framework | Streamlit |
| AI Backend | OpenAI API (`gpt-3.5-turbo`) |
| Secrets (local) | `.streamlit/secrets.toml` (gitignored) |
| Secrets (prod) | Streamlit Community Cloud secrets manager |

---

## Development Setup

### Local (manual)

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

App runs at `http://localhost:8501`.

### Dev Container (recommended for Codespaces)

Open the repo in a GitHub Codespace or VS Code with the Dev Containers extension. The container:
- Uses `mcr.microsoft.com/devcontainers/python:1-3.11-bullseye`
- Auto-installs requirements on container creation
- Auto-starts the Streamlit server on attach with CORS/XSRF protections disabled (safe for local dev)
- Forwards port `8501`

---

## API Key Handling

The app supports two methods for providing the OpenAI API key:

1. **UI input (default):** User pastes key into a `st.text_input(type="password")` field at runtime.
2. **Secrets file (preferred for deployments):** Store in `.streamlit/secrets.toml`:
   ```toml
   OPENAI_API_KEY = "sk-..."
   ```
   Access in code via `st.secrets["OPENAI_API_KEY"]`.

**Never commit `.streamlit/secrets.toml`** — it is gitignored.

---

## Application Flow (`streamlit_app.py`)

1. Display title and description
2. Prompt user for OpenAI API key → gate all further UI behind key presence
3. Show file uploader (`.txt`, `.md` only)
4. Show question text area (disabled until file is uploaded)
5. On submit: read and decode the file, build a single user message containing the full document + question, call `client.chat.completions.create()` with `stream=True`, stream response via `st.write_stream()`

The entire prompt is sent as one user message — there is no system prompt or conversation history.

---

## Dependencies

`requirements.txt` contains only two packages:

```
streamlit
openai
```

No pinned versions. When modifying dependencies, keep this file minimal and unpinned unless a specific version is required for a compatibility reason.

---

## Testing

There is no test suite. This is a template/demo project. If tests are added, use `pytest` and place test files in a `tests/` directory.

---

## Code Conventions

- **No type annotations** in the current codebase — match this style unless adding significant new logic.
- **Inline comments** are used extensively; maintain this pattern for Streamlit-specific calls.
- **No abstractions** — keep logic flat and readable inside `streamlit_app.py`. Avoid creating helper functions or classes for single-use operations.
- **Streamlit re-run model:** Streamlit reruns the entire script on each user interaction. Do not use mutable global state; use `st.session_state` if state persistence across reruns is needed.
- **Streaming:** Use `st.write_stream()` to display streamed OpenAI responses — do not buffer the full response before rendering.

---

## Deployment

Deployed on **Streamlit Community Cloud** by connecting the GitHub repo. No build step required. Secrets are managed through the Streamlit Cloud dashboard (not environment variables or `.env` files).

There are no GitHub Actions workflows. CI/CD is handled entirely by Streamlit Community Cloud on push to `main`.

---

## What NOT to Do

- Do not add a `Dockerfile` or `docker-compose.yml` — the dev container handles containerization for development.
- Do not pin dependency versions in `requirements.txt` without a specific reason.
- Do not introduce a multi-file module structure — this is a single-file template.
- Do not commit secrets or API keys.
- Do not add a system prompt or multi-turn conversation without a feature request — the current design is intentionally stateless per session.
