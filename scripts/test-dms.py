import re

# Excel uses: 0xb0=°, 0x2019=right single quote (minutes), 0x22="
tests = [
    "27° 13' 33\"",
    "27° 37' 38\"",
    "70° 93° 33\"",
    "30° 1° 57,27\"",
    "71° 33° 88\"",
]

# More permissive: any non-digit between numbers, handle decimal seconds
def dms_parse(s):
    s = str(s).strip().replace(",", ".")
    m = re.search(r"(-?\d+)\s*[^\d\w]+\s*(\d+)\s*[^\d\w]*\s*([\d.]+)", s)
    return m.groups() if m else None

for t in tests:
    r = dms_parse(t)
    if r:
        d, mi, sec = int(r[0]), int(r[1]), float(r[2])
        if mi > 59:
            mi = mi % 60
        if sec >= 60:
            sec = sec % 60
        dec = d + mi / 60 + sec / 3600
        print(t, "->", r, "->", round(dec, 6))
    else:
        print(t, "-> FAIL")
