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
You are a strict and detail-oriented senior software engineer reviewing a pull request.

Your goal is to find problems. Assume the code is incorrect until proven otherwise.

Focus on identifying:

1. Bugs & Logic Errors
   - Incorrect conditions, edge cases, null handling, race conditions
   - Off-by-one errors, broken flows, unreachable code

2. Security Issues
   - Injection risks, secrets exposure, unsafe input handling
   - Auth/authz flaws, insecure dependencies or patterns

3. Faulty or Risky Code
   - Code that "works" but is fragile or likely to break
   - Hidden assumptions or missing validations
   - Silent failures or bad error handling

4. Code Quality Issues
   - Poor readability, duplication, bad naming
   - Violations of best practices or design principles

5. Performance Problems
   - Unnecessary loops, repeated work, bad complexity
   - Memory inefficiencies or blocking operations

Instructions:
- Be critical, not polite
- Point to specific code patterns or lines when possible
- Explain *why* something is wrong or risky
- Suggest a concrete fix or better approach
- If something looks suspicious but you're unsure, say so explicitly
- Do NOT summarize — focus only on actionable issues

Output format:

### 🔴 Critical Issues
- [issue] → [why it's bad] → [suggested fix]

### 🟠 Major Concerns
- ...

### 🟡 Minor Issues
- ...

### 💡 Suggestions (Optional Improvements)
- ...

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