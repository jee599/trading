import json
import os
import re
import sys
import time
from typing import Any
from urllib.error import HTTPError
from urllib.request import Request, urlopen

API_BASE = "https://dev.to/api"
FOOTER = "[jidonglab.com](https://jidonglab.com)"
FOOTER_RE = re.compile(r"\n*\[jidonglab\.com\]\(https://jidonglab\.com\)\s*\Z")
COMMON_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Codex/1.0",
}

# Restores the first article body that was corrupted by a non-UTF-8 update path.
FORCED_BODIES = {
    3320745: """As a solo developer, the biggest time sink isn't code — it's **repetitive tasks**. Writing blog posts, managing deployments, handling PRs... Automate these and you can focus purely on building.

Here's my full automation stack:

## 1. Auto-Generated Build Logs

```
git push → husky pre-push hook → Claude CLI → markdown build log
```

Every time I push code, Claude analyzes the commit diff and generates a bilingual (Korean/English) build log. I develop, and blog content accumulates automatically.

## 2. Auto PR + Merge

```yaml
# .github/workflows/auto-merge-claude.yml
on:
  push:
    branches: ['claude/**']
jobs:
  auto-merge:
    # Creates PR → squash merges → deletes branch
```

Any branch Claude Code creates gets automatically merged to main. Zero manual PR management.

## 3. Daily Auto-Rebuild

```json
// vercel.json
{ "crons": [{ "path": "/api/revalidate", "schedule": "0 6 * * *" }] }
```

Write on dev.to → next morning it's automatically on my portfolio site.

## 4. Portfolio Auto-Sync

Drop a `.portfolio.yaml` in any GitHub repo:

```yaml
title: My Project
status: 운영중
stack: [Next.js, Stripe]
one_liner: AI-powered fortune telling
```

The portfolio site fetches and displays it automatically.

## The Core Principle

> **If you've done it manually twice, automate it.**

The time invested in automation pays back within days. And with AI tools, building the automation itself is fast.

---

Total setup time: ~2 hours. Time saved per week: ~5+ hours. The math is obvious.""",
}


def request_json(
    url: str,
    *,
    api_key: str | None = None,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
    retries: int = 5,
) -> Any:
    headers = dict(COMMON_HEADERS)
    if api_key:
        headers["api-key"] = api_key

    data = None
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json; charset=utf-8"

    request = Request(url, headers=headers, data=data, method=method)
    attempt = 0
    while True:
        try:
            with urlopen(request, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code == 429 and attempt < retries:
                retry_after = exc.headers.get("Retry-After")
                delay = int(retry_after) if retry_after and retry_after.isdigit() else min(60, 5 * (attempt + 1))
                time.sleep(delay)
                attempt += 1
                continue
            raise


def normalize_body(body: str) -> str:
    return FOOTER_RE.sub("", body.rstrip()).rstrip() + "\n\n" + FOOTER


def main() -> int:
    api_key = os.environ.get("DEVTO_API_KEY")
    if not api_key:
        print("DEVTO_API_KEY is not set.", file=sys.stderr)
        return 1

    articles = request_json(f"{API_BASE}/articles/me/published?per_page=1000", api_key=api_key)

    updated: list[dict[str, Any]] = []
    skipped: list[int] = []
    for article in articles:
        article_id = article["id"]
        current_body = article["body_markdown"]
        forced_body = FORCED_BODIES.get(article_id)
        target_body = normalize_body(forced_body if forced_body is not None else current_body)

        if current_body.rstrip() == target_body.rstrip():
            skipped.append(article_id)
            continue

        result = request_json(
            f"{API_BASE}/articles/{article_id}",
            api_key=api_key,
            method="PUT",
            payload={"article": {"body_markdown": target_body}},
        )
        updated.append({"id": article_id, "title": result["title"]})
        time.sleep(1)

    verified_articles = request_json(f"{API_BASE}/articles/me/published?per_page=1000", api_key=api_key)
    verified_footer_count = sum(1 for article in verified_articles if article["body_markdown"].rstrip().endswith(FOOTER))
    repaired_article = next(article for article in verified_articles if article["id"] == 3320745)

    print(
        json.dumps(
            {
                "total": len(articles),
                "updated_count": len(updated),
                "skipped_count": len(skipped),
                "verified_footer_count": verified_footer_count,
                "article_3320745_has_korean": "운영중" in repaired_article["body_markdown"],
                "article_3320745_has_arrow": "→" in repaired_article["body_markdown"],
                "article_3320745_has_em_dash": "—" in repaired_article["body_markdown"],
                "article_3320745_has_qmarks": "???" in repaired_article["body_markdown"],
                "updated": updated,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
