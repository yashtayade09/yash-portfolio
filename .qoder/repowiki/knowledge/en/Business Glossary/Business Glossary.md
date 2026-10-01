---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### dashboard_globals
- Definition：Django context processor registered in `core/settings.py` that injects the unread `ContactMessage` count into every dashboard template under the key `unread_count`, powering the topbar badge.

### generic_crud
- Definition：Shared view helper in `portfolio/views.py` that renders list/add/edit/delete pages for every content model through `dashboard/generic_list.html` and `dashboard/generic_form.html`, driven by a `(model, form_class, url_name, model_name)` tuple passed by each wrapper view.

### DELETE_MODEL_MAP
- Definition：Central mapping in `portfolio/views.py` from string model names to `(ModelClass, redirect_url_name)` pairs; `delete_item` looks up entries here so new models only need one map entry plus a URL route.
