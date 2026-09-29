from pathlib import Path
import json,sys
BASE=Path(__file__).resolve().parents[1]
p=BASE/'data'/'project.json'
d=json.loads(p.read_text(encoding='utf-8'))
errors=[]
for f in d.get('floors',[]):
    if not (BASE/f['plan']).exists(): errors.append(f'Missing plan: {f["plan"]}')
    for v in f.get('views',[]):
        if not 0<=float(v.get('x',-1))<=100 or not 0<=float(v.get('y',-1))<=100: errors.append(f'Bad coordinates: {v.get("id")}')
        if not (BASE/v.get('panorama','')).exists(): errors.append(f'Missing panorama for {v.get("id")}: {v.get("panorama")}')
if errors:
    print('PROJECT INVALID'); [print(' - '+e) for e in errors]; sys.exit(1)
print('PROJECT VALID')
print(f'Floors: {len(d.get("floors",[]))}')
print(f'Views: {sum(len(f.get("views",[])) for f in d.get("floors",[]))}')
