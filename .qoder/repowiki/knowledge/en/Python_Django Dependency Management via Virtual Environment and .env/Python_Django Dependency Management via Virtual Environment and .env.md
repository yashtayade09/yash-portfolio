---
kind: dependency_management
name: Python/Django Dependency Management via Virtual Environment and .env
category: dependency_management
scope:
    - '**'
source_files:
    - .venv/
    - .env
    - core/settings.py
---

This Django portfolio project manages its Python dependencies using a standard virtual environment (`.venv/`) with no pinned dependency manifest file present at the repository root. There is no `requirements.txt`, `pyproject.toml`, `Pipfile`, `poetry.lock`, or similar lockfile committed to version control, which means third-party packages are not explicitly versioned in the repo.

Key observations:
- **Virtual environment**: A `.venv/` directory exists at the repository root, indicating that `python -m venv` (or an equivalent tool) was used to create an isolated Python environment for this project.
- **No dependency manifest**: No `requirements.txt`, `pyproject.toml`, `Pipfile`, `poetry.lock`, `setup.py`, or `setup.cfg` was found. This means there is no declarative, reproducible list of installed packages checked into source control.
- **Environment variables via python-dotenv**: The project uses the `dotenv` package (`from dotenv import load_dotenv` in `core/settings.py`, line 15) to load configuration from a `.env` file at startup. The `.env` file stores secrets and runtime configuration such as `SECRET_KEY`, `DATABASE_URL`, `POSTGRES_*` credentials, and `ALLOWED_HOSTS` — but it does not declare Python package dependencies.
- **Django version**: Settings header comments indicate Django 5.0 (`Django 5.0`), and the codebase uses Django 5.0 conventions (e.g., `BigAutoField` default, modern settings layout). However, the exact version is not pinned anywhere in the repo.
- **Static assets**: Front-end assets live directly under `static/` (`dashboard.css`, `dashboard.js`) and `assets/` (images, certificates, etc.). There is no npm/yarn/pip-based asset pipeline; these are plain files served by Django's staticfiles app.
- **Database**: The default database is SQLite (`db.sqlite3`), configured in `settings.py`; PostgreSQL connection parameters are present only in `.env` and are not activated in the current settings.

Conventions observed:
- Secrets are kept out of source control via `.env` and loaded through `python-dotenv`.
- Third-party Python packages are expected to be installed manually into the local `.venv` environment rather than declared in a shared manifest.
- No vendoring strategy (no `vendor/` directory) and no private PyPI registry configuration is visible.

Constraints / enforcement:
- Because there is no lockfile or manifest, there is no automated mechanism enforcing consistent dependency versions across environments. Reproducing the exact environment requires manual recreation of the `.venv` and reinstallation of packages without version pinning.
- The `.env` file contains plaintext credentials (including a sample `postgres:password`); while this is convenient for development, it represents a security constraint that should be addressed before any production use.