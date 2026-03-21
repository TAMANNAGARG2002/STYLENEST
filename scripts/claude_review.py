import os
import requests

API_KEY = os.environ.get("ANTHROPIC_API_KEY")

if not API_KEY:
    raise Exception("Missing ANTHROPIC_API_KEY")

# Read diff
with open("pr.diff", "r") as f:
    diff = f.read()

# Limit size (important for Claude)
diff = diff[:20000]

prompt = f"""
You are a senior software engineer reviewing a pull request.

Focus on:
- Bugs
- Security issues
- Code quality
- Performance
- Best practices

Provide:
1. Summary
2. Issues found
3. Suggestions

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
        "model": "claude-3-sonnet-20240229",
        "max_tokens": 1000,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
)

data = response.json()

if "content" not in data:
    raise Exception(f"Claude API error: {data}")

review = data["content"][0]["text"]

# Save output
with open("review.txt", "w") as f:
    f.write(review)

print("Review generated successfully.")