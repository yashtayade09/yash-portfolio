---
kind: error_handling
name: Django Built-in Error Handling (Http404, messages, JsonResponse)
category: error_handling
scope:
    - '**'
source_files:
    - portfolio/views.py
    - core/settings.py
    - manage.py
    - templates/dashboard/messages.html
---

## What system/approach is used

The repository does not define a custom error-handling framework. It relies entirely on Django's built-in mechanisms:

- `django.http.Http404` for resource-not-found and unknown-action/model cases.
- `django.contrib.messages` for user-facing success/error notifications in the admin dashboard.
- `django.http.JsonResponse` with explicit HTTP status codes for JSON API responses.
- Plain Python `try/except Exception` as a catch-all around one JSON endpoint.
- No custom exception classes, no sentinel errors, no middleware-based error handler, no `panic/recover` equivalent.

## Key files and packages

- `portfolio/views.py` — the sole location where errors are raised or caught.
- `core/settings.py` — standard Django settings; no custom exception handlers or middleware registered.
- `templates/dashboard/messages.html` — template that renders the message framework output.
- `manage.py` — uses `ImportError` to surface missing-Django-installation failures.

## Architecture and conventions

**1. View-level 404s via `Http404`**

`views.py` raises `Http404` in three places:

- `home_view`: when the static front page file is missing (`raise Http404('Front page not found.')`).
- `generic_crud`: when an unknown `action` query parameter is passed (`raise Http404('Unknown action.')`).
- `delete_item`: when the requested model name is not in `DELETE_MODEL_MAP` (`raise Http404('Unknown model.')`).

Missing objects are obtained through `get_object_or_404`, which internally raises `Http404`. This is the pattern used consistently across all CRUD views (e.g. `manage_hero_roles`, `delete_hero_role`, `toggle_message_read`, `delete_message`).

**2. User feedback via `messages`**

User-visible errors go through `messages.error(request, ...)` rather than raising exceptions. Examples:

- Invalid login credentials: `messages.error(request, "Invalid username or password.")`.
- Empty hero role text: `messages.error(request, "Role text cannot be empty.")`.
- Form validation failure in `generic_crud`: `messages.error(request, "Please fix the highlighted fields below.")`.

Success feedback uses `messages.success(...)`. The `MessageMiddleware` is enabled in `INSTALLED_APPS` and `MIDDLEWARE` in `settings.py`, and the `dashboard/messages.html` template renders them.

**3. JSON API error responses**

The `contact_api` view wraps its body parsing and persistence in `try/except Exception as e:` and returns:

```python
JsonResponse({'status': 'success', 'message': '...'}, status=201)
JsonResponse({'status': 'error', 'message': str(e)}, status=400)
JsonResponse({'status': 'error', 'message': 'Only POST requests allowed'}, status=405)
```

The `portfolio_api` view returns a 404-style JSON response when no profile exists:

```python
return JsonResponse({'error': 'Profile not configured'}, status=404)
```

This is the only place in the codebase where a broad `Exception` is caught; other views let Django handle uncaught exceptions.

**4. No custom error types or middleware**

There is no `errors/` package, no custom exception class hierarchy, no `handler404` / `handler500` overrides in `urls.py`, and no custom middleware in `MIDDLEWARE` beyond the defaults. Error handling is therefore purely per-view.

## Conventions and constraints

Observed patterns (descriptive):

- Resource-missing conditions use `Http404` (raised directly or via `get_object_or_404`).
- User-facing validation or business-rule failures use `messages.error` and re-render the form.
- JSON endpoints return structured dicts with a `status` field and an HTTP status code via `JsonResponse`.
- There is no centralized logging of errors; the only log-relevant path is the bare `except Exception` in `contact_api`, which converts the exception into a client-facing error JSON payload.
- `manage.py` catches `ImportError` from `django.core.management` and re-raises it with a more descriptive message — this is the only non-Django exception usage outside `views.py`.

Enforced rules (from authoritative sources):

- `settings.MIDDLEWARE` includes only Django defaults (`SecurityMiddleware`, `SessionMiddleware`, `CommonMiddleware`, `CsrfViewMiddleware`, `AuthenticationMiddleware`, `MessageMiddleware`, `XFrameOptionsMiddleware`) — no custom error middleware is registered.
- `settings.INSTALLED_APPS` registers only `django.contrib.admin`, `auth`, `contenttypes`, `sessions`, `messages`, `staticfiles`, and `portfolio` — no third-party error-handling packages are present.
- `DEBUG` is read from the `DEBUG` environment variable (defaulting to `'True'`), so production-like behavior would suppress detailed tracebacks but still rely on Django's default 404/500 pages since no custom handlers override them.

Limitations observed:

- The `try/except Exception` in `contact_api` swallows the full stack trace and exposes the raw exception string to clients, which is both a security and observability concern.
- There is no global `handler404` / `handler500` configuration, so Django's default error pages are used.
- No structured logging is configured; errors are not recorded anywhere except the console during development.