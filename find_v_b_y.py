with open('temp_chunk.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

idx = c.find('let p=Math.round(s*tz.FPS)')
print(c[idx:idx+400])

