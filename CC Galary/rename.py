import re
import sys
import unicodedata

def remove_emojis_and_symbols(text: str) -> str:
    cleaned = []

    for ch in text:
        cat = unicodedata.category(ch)

        # Skip emojis, symbols, control chars, surrogates
        if cat.startswith(("S", "C")):
            continue

        cleaned.append(ch)

    return "".join(cleaned)


def clean_text(text: str, use_underscore=False):
    # 1. Remove Windows forbidden filename characters
    text = re.sub(r'[\\/:*?"<>|]', '', text)

    # 2. Remove emojis + symbols
    text = remove_emojis_and_symbols(text)

    # 3. Normalize whitespace (multi-line safe)
    text = re.sub(r'\s+', ' ', text).strip()

    # 4. Optional underscore mode
    if use_underscore:
        text = text.replace(' ', '_')

    return text


if __name__ == "__main__":
    print("Paste your text (Ctrl+Z then Enter to finish on Windows):\n")

    # Read MULTI-LINE input
    user_input = sys.stdin.read()

    result = clean_text(user_input, use_underscore=False)

    print("\n" + "="*40)
    print("CLEANED OUTPUT:")
    print("="*40)
    print(result)