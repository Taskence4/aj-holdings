from pathlib import Path
import json, math
raw=json.loads(Path('output/review/natural-earth-land.geojson').read_text(encoding='utf-8'))
rings=[]
for f in raw['features']:
 g=f['geometry']
 if g['type']=='Polygon': rings.append(g['coordinates'][0])
 elif g['type']=='MultiPolygon': rings.extend(p[0] for p in g['coordinates'])
def inside(x,y,ring):
 result=False
 for i in range(len(ring)):
  ax,ay=ring[i-1];bx,by=ring[i]
  if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax: result=not result
 return result
bounds=[(min(x for x,y in r),max(x for x,y in r),min(y for x,y in r),max(y for x,y in r),r) for r in rings]
points=[]
for lat in range(-57,85,2):
 for lon in range(-180,180,2):
  if any(a<=lon<=b and c<=lat<=d and inside(lon,lat,r) for a,b,c,d,r in bounds): points.append([lon,lat])
Path('assets/globe-land.js').write_text('// Natural Earth 1:110m land, public domain. Sampled at 2-degree intervals.\nwindow.AJ_GLOBE_LAND='+json.dumps(points,separators=(',',':'))+';\n',encoding='utf-8')
print(f'Generated {len(points)} geographic land points')
