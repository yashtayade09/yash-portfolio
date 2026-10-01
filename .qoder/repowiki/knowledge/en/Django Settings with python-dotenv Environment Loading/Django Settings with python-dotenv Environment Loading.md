---
kind: configuration_system
name: Django Settings with python-dotenv Environment Loading
category: configuration_system
scope:
    - '**'
source_files:
    - core/settings.py
    - .env
---

## Approach

The project uses the standard Django settings module (`core/settings.py`) as its single source of application configuration, augmented by `python-dotenv` to load environment variables from a `.env` file at import time.

## Key Files

- `core/settings.py` — Django settings module; only configuration file in the repo.
- `.env` — Local development environment variables (secret key, debug flag, database connection string and Postgres credentials, allowed hosts).
- `manage.py` — Django management entry point (no custom config loading).
- `core/asgi.py`, `core/wsgi.py` — WSGI/ASGI entry points that import `django.conf.settings` (default behavior).

## Architecture and Conventions

1. **Single settings module.** All configuration lives in `core/settings.py`. There is no environment-specific split (e.g. no `settings_dev.py` / `settings_prod.py`).
2. **Environment-first for secrets and toggles.** The module calls `load_dotenv()` at the top (line 17) before reading any values, then pulls runtime-sensitive settings via `os.getenv(...)`:
   - `SECRET_KEY` (line 25)
   - `DEBUG` (line 28), parsed as a boolean by comparing against the string `'True'`
   - `ALLOWED_HOSTS` (line 30), split on commas into a list
3. **Hardcoded defaults.** Every `os.getenv` call supplies a default value, so the app runs without a `.env` file (with insecure defaults such as `django-insecure-fallback-key` for `SECRET_KEY` and `DEBUG=True`).
4. **Database configured inline.** `DATABASES` is defined directly in `settings.py` pointing at an SQLite file (`db.sqlite3`). The `.env` also contains a `DATABASE_URL` plus `POSTGRES_*` variables, but they are never read by `settings.py` — they appear to be leftover or intended for another deployment target.
5. **Static/media paths derived from `BASE_DIR`.** `BASE_DIR = Path(__file__).resolve().parent.parent` is used to resolve `MEDIA_ROOT`, `STATICFILES_DIRS`, and `STATIC_ROOT` relative to the project root.
6. **No feature flags, YAML/TOML configs, or external secret managers.** Configuration is purely Python + env vars.
7. **Template context processors.** A custom processor `portfolio.context_processors.dashboard_globals` is registered under `TEMPLATES[0]['OPTIONS']['context_processors']` (line 68), which is how the app exposes runtime configuration values to templates.

## Conventions and Constraints

- **All runtime configuration goes through `os.getenv` in `core/settings.py`.** No other file in the repository reads `.env` or environment variables directly for configuration purposes.
- **Boolean env vars are compared as strings** (`os.getenv('DEBUG', 'True') == 'True'`); callers must pass the literal string `'True'` / `'False'`, not Python booleans.
- **Comma-separated lists are supported for `ALLOWED_HOSTS`** via an explicit `.split(',')` call.
- **Defaults are always provided** to `os.getenv`; missing keys do not raise `KeyError`.
- **There is no validation layer** over loaded settings — invalid values (e.g. malformed `DATABASE_URL`) surface as runtime errors when Django initializes.
- **`.env` is committed to the repository** (it contains a placeholder secret key and Postgres credentials), which means it is not treated as a true secret store.
- **Duplicate static/media blocks exist** in `settings.py` (lines 91–94 and again lines 130–136), meaning the second block silently overrides the first; this is a code quality issue rather than an intentional convention.