import os
import requests

API_KEY = os.environ.get("ANTHROPIC_API_KEY")

MAX_OUTPUT_TOKENS = int(os.environ.get("MAX_OUTPUT_TOKENS", 800))
MAX_INPUT_CHARS = int(os.environ.get("MAX_INPUT_CHARS", 15000))  # rough token control

if not API_KEY:
    raise Exception("Missing ANTHROPIC_API_KEY")

# Read diff
with open("pr.diff", "r") as f:
    diff = f.read()

# Limit input size (very important)
if len(diff) > MAX_INPUT_CHARS:
    diff = diff[:MAX_INPUT_CHARS] + "\n\n[TRUNCATED]"

prompt = f"""
You are a senior software engineer reviewing a pull request.

Focus on:
- Bugs
- Security issues
- Code quality
- Performance
- Best practices

Be concise.

PR Diff:
{diff}
"""

response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    },
    json={
        "model": "claude-4-sonnet-20250514",
        "max_tokens": MAX_OUTPUT_TOKENS,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
)

data = response.json()

if "content" not in data:
    raise Exception(f"Claude API error: {data}")

review = data["content"][0]["text"]

with open("review.txt", "w") as f:
    f.write(review)

print(f"Review generated (max_tokens={MAX_OUTPUT_TOKENS}, input_chars={len(diff)})")