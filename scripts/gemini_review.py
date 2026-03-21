import os
from google import genai

# Env vars
API_KEY = os.environ.get("GEMINI_API_KEY")
MAX_OUTPUT_TOKENS = int(os.environ.get("MAX_OUTPUT_TOKENS", 800))
MAX_INPUT_CHARS = int(os.environ.get("MAX_INPUT_CHARS", 15000))

if not API_KEY:
    raise Exception("Missing GEMINI_API_KEY")

# Initialize client (auto-reads GEMINI_API_KEY)
client = genai.Client()

# Read diff
with open("pr.diff", "r") as f:
    diff = f.read()

# Limit input size
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

# Generate response
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=prompt,
    config={
        "max_output_tokens": MAX_OUTPUT_TOKENS,
        "temperature": 0.2
    }
)

# Extract text safely
review = response.text if hasattr(response, "text") else str(response)

# Write output
with open("review.txt", "w") as f:
    f.write(review)

print(f"Review generated (max_tokens={MAX_OUTPUT_TOKENS}, input_chars={len(diff)})")