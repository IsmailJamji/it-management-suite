from pathlib import Path

p = Path(__file__).resolve().parent.parent / "src/pages/LoginPage.tsx"
lines = p.read_text(encoding="utf-8").splitlines(keepends=True)

start = next(i for i, l in enumerate(lines) if "{/* Header */}" in l or "Header —" in l or (i > 175 and "text-center" in l and "Header" in lines[i-1]))
# find start by comment Header
for i, l in enumerate(lines):
    if "/* Header */" in l:
        start = i
        break

end = start
while end < len(lines) and "</header>" not in lines[end]:
    end += 1
end += 1

new_block = """        <header className="flex flex-col items-center px-2 pt-2 pb-8">
          <AppLogoMark size="lg" className="mb-6" />
          <h1 className="sr-only">IT Suite</h1>
          <p className="max-w-xs text-center text-sm leading-relaxed text-cloud-muted">
            {t('login.subtitle')}
          </p>
        </header>
"""

lines[start:end] = [new_block]
p.write_text("".join(lines), encoding="utf-8")
print(f"Replaced lines {start+1}-{end}")
