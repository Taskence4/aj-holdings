from pathlib import Path
p=Path('style.css');s=p.read_text(encoding='utf-8-sig')
s=s.replace('--paper: #f7f6f2;','''--brand-green: #00852b;
  --brand-yellow: #e99b00;
  --paper: #f9ecdf;
  --forest: #063b25;
  --forest-deep: #042d1c;
  --forest-lift: #085032;
  --on-dark-muted: #ccdac6;
  --globe-land: #91b988;''').replace('--ink: #222820;','--ink: #123b26;').replace('--muted: #696d65;','--muted: #536451;').replace('--olive: #8d8057;','--accent: var(--brand-green);').replace('--line: #d7d4c9;','--line: #d7d4bd;').replace('--dark: #101917;','--dark: var(--forest);').replace('var(--olive)','var(--accent)')
changes={
'#b2a67f':'var(--brand-yellow)','#b6a571':'var(--brand-green)',
'#ded8c6':'#f5b72e','#193743':'var(--forest-deep)',
'#061a2780':'#042d1c9c','#0b222acf':'#042d1ce0','#0b222a10':'#063b2538',
'#e8e5d9':'var(--brand-yellow)','#e4e9e9':'var(--paper)',
'#b1bdb6':'var(--on-dark-muted)','#d1cfbe':'var(--brand-yellow)',
'#d3dcda':'var(--on-dark-muted)','#182c2e':'var(--forest)',
'#e4e7e0':'var(--paper)','#bdc6c3':'var(--on-dark-muted)',
'#bac2b7':'var(--on-dark-muted)','#b3a579':'var(--brand-yellow)',
'#aab4ab':'var(--on-dark-muted)','#afb8b0':'var(--on-dark-muted)',
'#949b8660':'#00852b55','#071c22bd':'#042d1cbd',
'#c1b38d':'var(--brand-yellow)','#b8c0b6':'var(--on-dark-muted)',
'#eeece3':'#f0e2cf','#8e886f':'var(--brand-green)',
'#968965':'var(--brand-green)','#071820bd':'#042d1cbd',
'#8b846d':'var(--brand-green)','#8d856b':'var(--brand-green)',
'#eae8df':'#eee4ce','#7d7e71':'var(--muted)',
'#172925':'var(--forest-lift)','#aeb9ad':'var(--on-dark-muted)',
'#98a591':'var(--on-dark-muted)','#d4cbb5':'var(--brand-yellow)',
'#d4ddda':'var(--paper)','#162b29':'var(--forest)',
'#0c1514':'var(--forest-deep)','#a9b5ab':'var(--on-dark-muted)',
'#7c8b7b':'#91b988','#e3e5db':'var(--paper)',
'#a59a72':'var(--brand-yellow)','#a6b0a3':'var(--on-dark-muted)',
'#c0c6b9':'var(--paper)','#132823':'var(--forest-deep)',
'#071a2880':'#042d1c9c','#071a2820':'#063b2538','#0b222ae6':'#042d1ce6',
'#d1bd84':'var(--brand-yellow)','#a5aa7655':'#91b98855',
'#38493d':'#187243','#0b1815':'var(--forest-deep)','#07130e50':'#042d1c50',
'#a5aa7630':'#91b98830','#deded0':'var(--paper)',
'#b4bdad':'var(--on-dark-muted)','#d8ddcd':'var(--paper)',
'#101c19':'var(--forest)','#b1bdaf':'var(--on-dark-muted)',
'#bdc6ba':'var(--on-dark-muted)','#a3ae914d':'#e99b0066',
}
for old,new in changes.items(): s=s.replace(old,new)
s=s.replace('background: #fff;', 'background: var(--paper);').replace('color: #fff;', 'color: var(--paper);').replace('color: #111;', 'color: var(--forest-deep);')
s=s.replace('''::selection {
  background: var(--brand-yellow);
  color: var(--paper);
}''','''::selection {
  background: var(--brand-yellow);
  color: var(--forest-deep);
}''')
s=s.replace('''.button-light {
  background: var(--paper);
  color: var(--ink);
}''','''.button-light {
  background: var(--brand-yellow);
  color: var(--forest-deep);
}''')
s+='''
/* Reference palette: green leads, yellow signals action, warm paper provides rest. */
h2 { color: var(--forest); }
.dark h2 { color: var(--paper); }
.dark :focus-visible, .hero :focus-visible, .masthead :focus-visible, .mobile-nav :focus-visible { outline-color: var(--brand-yellow); }
.dark .text-link { border-bottom-color: #e99b0066; }
.dark .text-link span, .hero-secondary span { color: var(--brand-yellow); }
.portfolio-wall img { filter: brightness(0) saturate(100%) invert(20%) sepia(33%) saturate(1100%) hue-rotate(101deg) brightness(85%) contrast(98%); opacity: .85; }
.locations button[aria-pressed="true"] { background: #e99b0012; box-shadow: inset 2px 0 var(--brand-yellow); }
.globe-controls button:hover { border-color: var(--brand-yellow); color: var(--brand-yellow); }
'''
p.write_text(s,encoding='utf-8')
p=Path('index.html');s=p.read_text(encoding='utf-8');s=s.replace('content="#10272e"','content="#063b25"');p.write_text(s,encoding='utf-8')
p=Path('js/globe.js');s=p.read_text(encoding='utf-8-sig')
s=s.replace('  const tilt = 23 * rad;', '''  const tilt = 23 * rad;
  const styles = getComputedStyle(document.documentElement);
  const theme = {
    yellow: styles.getPropertyValue('--brand-yellow').trim(),
    paper: styles.getPropertyValue('--paper').trim(),
    forest: styles.getPropertyValue('--forest').trim(),
    deep: styles.getPropertyValue('--forest-deep').trim(),
    land: styles.getPropertyValue('--globe-land').trim(),
  };''')
s=s.replace('"rgba(170,171,112,.07)"','theme.yellow + "12"').replace('"rgba(170,171,112,0)"','theme.yellow + "00"')
s=s.replace('"#304237"','"#187243"').replace('"#1c3028"','theme.forest').replace('"#0d1b16"','theme.deep')
s=s.replace('"rgba(182,181,141,.12)"','theme.land + "24"')
s=s.replace('`rgba(171,173,124,${0.26 + p.z * 0.5})`','theme.land + Math.round((0.3 + p.z * 0.6) * 255).toString(16).padStart(2, "0")')
s=s.replace('"rgba(187,187,141,.26)"','theme.land + "55"')
s=s.replace('"rgba(228,205,148,.15)"','theme.yellow + "26"').replace('"rgba(228,205,148,.07)"','theme.yellow + "12"')
s=s.replace('"#d9c38b"','theme.yellow').replace('"rgba(217,195,139,.5)"','theme.yellow + "80"').replace('"#ead9ae"','theme.yellow')
s=s.replace('"rgba(10,25,19,.88)"','theme.deep + "eb"').replace('"#eee9d9"','theme.paper')
p.write_text(s,encoding='utf-8')
