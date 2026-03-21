import os
import requests
import json

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise Exception("Missing GEMINI_API_KEY")

# Configurable limits
MAX_INPUT_CHARS = int(os.environ.get("MAX_INPUT_CHARS", 12000))
MAX_OUTPUT_TOKENS = int(os.environ.get("MAX_OUTPUT_TOKENS", 500))

# Read and truncate diff
with open("pr.diff", "r") as f:
    diff = f.read()
if len(diff) > MAX_INPUT_CHARS:
    diff = diff[:MAX_INPUT_CHARS] + "\n\n[TRUNCATED DUE TO SIZE]"

# Prepare prompt
prompt_text = f"""
You are a senior engineer performing a code review. Summarize key issues, bugs, and suggestions.

Diff:
{diff}
"""

# Gemini REST API endpoint
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

body = {
    "contents": [
        {"parts": [{"text": prompt_text}]}
    ],
    "maxOutputTokens": MAX_OUTPUT_TOKENS
}

# Call Gemini API
response = requests.post(
    url,
    params={"key": API_KEY},
    headers={"Content-Type": "application/json"},
    data=json.dumps(body)
)

if response.status_code != 200:
    raise Exception(f"Gemini API error: {response.status_code} {response.text}")

data = response.json()
# Extract text output
text_output = ""
if "candidates" in data:
    for part in data["candidates"][0]["content"][0]["parts"]:
        if "text" in part and part["text"]:
            text_output += part["text"]

# Write review output
with open("review.txt", "w") as f:
    f.write(text_output)

print("Gemini review generated.")