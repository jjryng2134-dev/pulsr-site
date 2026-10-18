# 큰 제목 글꼴(검은고딕)을 홈 화면에 실제로 쓰는 글자만 담아 public/fonts/bhs.woff2로 만든다.
# 문구를 고치면 다시 돌린다: python3 scripts/display-font.py
import re, pathlib, urllib.parse, urllib.request
root = pathlib.Path(__file__).resolve().parent.parent
src = ''.join(p.read_text(encoding='utf-8') for p in (root / 'src/home').glob('*.js*'))
chars = sorted({c for c in src if '가' <= c <= '힣'} | {chr(i) for i in range(32, 127)} | set('·↗→…'))
text = ''.join(chars)
css_url = 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap&text=' + urllib.parse.quote(text)
ua = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}
css = urllib.request.urlopen(urllib.request.Request(css_url, headers=ua)).read().decode()
url = re.search(r'url\((https://[^)]+)\)', css).group(1)
data = urllib.request.urlopen(urllib.request.Request(url, headers=ua)).read()
(root / 'public/fonts/bhs.woff2').write_bytes(data)
print(len(chars), 'glyphs', len(data), 'bytes')
