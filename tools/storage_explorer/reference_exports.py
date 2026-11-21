"""Portable, value-free exports of the storage reference. Standard library only."""
from pathlib import Path
import json,hashlib,re,base64

def make_structure(payload):
 records=[]
 def visit(n,parent=None,path=(),inherited=None):
  path=path+(n['name'],); key='/'.join(path); sid='wp2-'+hashlib.sha256(key.encode()).hexdigest()[:16]
  # Paths may repeat labels at different offsets; offsets are part of identity where present.
  if n.get('offset') is not None:sid='wp2-'+hashlib.sha256((key+'@'+str(n['offset'])).encode()).hexdigest()[:16]
  space=n.get('storage',inherited)
  if len(path)==2 and n['name']=='NAND':space='Physical NAND'
  if len(path)==2 and n['name']=='NOR':space='NOR'
  if n['name']=='Logical NAND':space='Logical NAND'
  space={'Logical NAND':'nand-logical','Physical NAND':'nand-physical','NOR':'nor-physical'}.get(space,space)
  item=dict(id=sid,parentId=parent,name=n['name'],path=list(path),sizeBytes=n['bytes'],category=n['kind'],description=n.get('note',''),verification=n.get('verification','Unspecified'),addressSpace=space,range=None,source=n.get('source'),evidence=n.get('evidence',{}),children=[])
  if 'offset'in n:
   assert space in ['nand-logical','nand-physical','nor-physical'];item['range']={'startByte':n['offset'],'endByteExclusive':n['offset']+n['bytes']}
  if 'role'in n:item['role']=n['role']
  if 'fileId'in n:item['partitionFileId']=n['fileId']
  if 'sha256'in n:item['contentSha256']=n['sha256']
  records.append(item)
  for c in n.get('children',[]):item['children'].append(visit(c,sid,path,space))
  return sid
 root=visit(payload['tree'])
 data={'format':'fmc-storage-reference','schemaVersion':'1.0.0','model':{'id':'cmf-watch-pro-2','name':'CMF Watch Pro 2'},'analysisDate':'2026-11-21','units':{'sizes':'bytes','offsets':'bytes','MiB':1048576},'physicalMainCapacityBytes':132*1048576,'addressSpaces':[{'id':'nand-physical','sizeBytes':128*1048576,'note':'Physical main area; raw FTL content not acquired.'},{'id':'nand-logical','sizeBytes':123*1048576,'note':'Translated view of NAND; not additional physical capacity.'},{'id':'nor-physical','sizeBytes':4*1048576,'note':'Separate NOR chip.'}],'interpretation':['Hierarchy is a capacity/file view, not a physical adjacency map.','Only nodes with explicit range values have a documented contiguous byte range. Aggregate nodes may combine disjoint metadata or padding.','NAND logical offsets cannot be interpreted as physical NAND offsets.','Child sizes sum to the parent, but child ranges may use different address spaces.','No stock free-space figure is established. FF bytes and partition headroom are not classified as usable filesystem space.','Device-capture evidence is not a factory-state measurement.','Package checksums establish consistency, not publisher cryptographic authenticity.'],'scope':{'stockFirmware':'1.0.0.73','stockPackageSha256':payload['stockPackage']['sha256'],'rawDumpsIncluded':False,'personalValuesIncluded':False,'installedAppsIncluded':False,'factoryFreeSpaceVerified':False,'captureIsAtomic':False},'rootId':root,'nodes':records}
 ids={n['id']:n for n in records};assert len(ids)==len(records)
 for n in records:
  if n['children']:assert sum(ids[c]['sizeBytes']for c in n['children'])==n['sizeBytes']
  if n['range']:
   assert n['range']['endByteExclusive']-n['range']['startByte']==n['sizeBytes']
   limit=next(a['sizeBytes']for a in data['addressSpaces']if a['id']==n['addressSpace']);assert 0<=n['range']['startByte']<n['range']['endByteExclusive']<=limit
  if n['parentId']:assert n['id']in ids[n['parentId']]['children']
 return data

def make_schema():
 nullable={'type':['string','null']}
 node={'type':'object','required':['id','parentId','name','path','sizeBytes','category','description','verification','addressSpace','range','source','evidence','children'],'additionalProperties':False,'properties':{'id':{'type':'string','pattern':'^wp2-[0-9a-f]{16}$'},'parentId':nullable,'name':{'type':'string'},'path':{'type':'array','items':{'type':'string'}},'sizeBytes':{'type':'integer','minimum':1},'category':{'type':'string'},'description':{'type':'string'},'verification':{'type':'string'},'addressSpace':{'type':['string','null'],'enum':['nand-logical','nand-physical','nor-physical',None]},'range':{'oneOf':[{'type':'null'},{'type':'object','additionalProperties':False,'required':['startByte','endByteExclusive'],'properties':{'startByte':{'type':'integer','minimum':0},'endByteExclusive':{'type':'integer','minimum':1}}}]},'source':nullable,'evidence':{'type':'object','additionalProperties':{'type':'string'}},'children':{'type':'array','items':{'type':'string'},'uniqueItems':True},'role':{'type':'string','description':'Documented purpose, separate from content verification.'},'partitionFileId':{'type':'integer','minimum':0,'maximum':255},'contentSha256':{'type':'string','pattern':'^[0-9a-f]{64}$'}}}
 return {'$schema':'https://json-schema.org/draft/2020-12/schema','title':'FMC storage reference v1','description':'Byte sizes and provenance for a storage-reference hierarchy. Cross-node sums, range bounds and parent links are additional semantic invariants checked by the generator.','type':'object','additionalProperties':False,'required':['format','schemaVersion','model','analysisDate','units','physicalMainCapacityBytes','addressSpaces','interpretation','scope','rootId','nodes'],'properties':{'format':{'const':'fmc-storage-reference'},'schemaVersion':{'const':'1.0.0'},'model':{'type':'object','required':['id','name'],'properties':{'id':{'type':'string'},'name':{'type':'string'}}},'analysisDate':{'type':'string','format':'date'},'units':{'type':'object','properties':{'sizes':{'const':'bytes'},'offsets':{'const':'bytes'},'MiB':{'const':1048576}}},'physicalMainCapacityBytes':{'type':'integer','minimum':1},'addressSpaces':{'type':'array','items':{'type':'object','required':['id','sizeBytes','note'],'properties':{'id':{'type':'string'},'sizeBytes':{'type':'integer','minimum':1},'note':{'type':'string'}}}},'interpretation':{'type':'array','items':{'type':'string'}},'scope':{'type':'object','additionalProperties':False,'required':['stockFirmware','stockPackageSha256','rawDumpsIncluded','personalValuesIncluded','installedAppsIncluded','factoryFreeSpaceVerified','captureIsAtomic'],'properties':{'stockFirmware':{'type':'string'},'stockPackageSha256':{'type':'string','pattern':'^[0-9a-f]{64}$'},'rawDumpsIncluded':{'const':False},'personalValuesIncluded':{'const':False},'installedAppsIncluded':{'const':False},'factoryFreeSpaceVerified':{'const':False},'captureIsAtomic':{'const':False}}},'rootId':{'type':'string'},'nodes':{'type':'array','items':node}}}

def make_markdown(data):
 lines=['# CMF Watch Pro 2 storage reference','', 'Reference firmware: **1.0.0.73**. Analysis date: **21 November 2026**.','', 'The watch has **128 MiB NAND main storage** and **4 MiB NOR**. NAND exposes 123 MiB of logical storage; the remaining 5 MiB is managed by its flash translation layer. This is a firmware and hardware reference, not a factory-state dump.','', '## Reading the structure','']+['- '+x for x in data['interpretation']]+['','Offsets and sizes are integers in bytes. Address-space names are part of every range; offsets from different spaces must not be combined. `endByteExclusive` excludes the byte at that endpoint. A null range means no contiguous range is specified.','', '## Hierarchy','', '```text']
 for n in data['nodes']:lines.append('  '*(len(n['path'])-1)+n['name']+' — '+f"{n['sizeBytes']:,} bytes")
 lines+=['```','','## Region and file records','']
 for n in data['nodes']:
  lines+=['### '+' / '.join(n['path']),'',f"ID: `{n['id']}`. Size: **{n['sizeBytes']:,} bytes**. Category: `{n['category']}`.",'',n['description'],'', '**Verification:** '+n['verification']+'.']
  if n.get('role'):lines+=['','**Purpose:** '+n['role']+'.']
  if n['range']:lines+=['',f"**Range:** `{n['addressSpace']}` / `[0x{n['range']['startByte']:08X}, 0x{n['range']['endByteExclusive']:08X})`."]
  if n['source']:lines+=['','**Source:** '+n['source']+'.']
  for k,v in n['evidence'].items():lines+=['','**'+k+':** '+v]
  lines+=['']
 lines+=['## Reuse and tooling','', 'The JSON companion uses format `fmc-storage-reference`, schema version `1.0.0`, stable node IDs and parent/child links. A JSON Schema companion describes its fields. IDs are deterministic from hierarchy paths and explicit offsets; a renamed or relocated record receives a new ID.','', 'The offline HTML viewer opens directly in a browser and performs no network or device requests. It includes the Lilex font under the SIL Open Font License 1.1; the license is embedded in the HTML. No firmware images, raw dumps, installed applications, personal configuration values, GPS coordinates or raw log/crash contents are included.','', 'Sources: stock JX402_V1.0.0.73.bin, checksum-verified saved NAND/NOR captures, the Actions SDK and recorded firmware-driver analysis. Capture observations span a running system and are not an atomic snapshot.','', 'Stock package SHA-256: `'+data['scope']['stockPackageSha256']+'`.','']
 return '\n'.join(lines)

def build_exports(payload,template,out):
 data=make_structure(payload);schema=make_schema();md=make_markdown(data)
 theme=(out/'editor-theme.css').read_text(encoding='utf-8').replace('__LILEX_FONT_DATA__',base64.b64encode((out/'assets/Lilex.ttf').read_bytes()).decode())
 template=template.replace('__EDITOR_STYLES__',theme).replace('__POSTER_EXPORT_JS__',(out/'poster-exports.js').read_text(encoding='utf-8'))
 def safe(value):return json.dumps(value,ensure_ascii=True).replace('<','\\u003c')
 html=template.replace('__STORAGE_DATA__',safe(payload)).replace('__STRUCTURE_DATA__',safe(data)).replace('__REFERENCE_MARKDOWN__',safe(md)).replace('__SCHEMA_DATA__',safe(schema))
 assert all(token not in html for token in ['__STORAGE_DATA__','__STRUCTURE_DATA__','__REFERENCE_MARKDOWN__','__SCHEMA_DATA__'])
 (out/'index.html').write_text(html,encoding='utf-8',newline='\n')
 dest=out/'downloads';dest.mkdir(exist_ok=True)
 (dest/'wp2-storage-structure.v1.json').write_text(json.dumps(data,indent=2),encoding='utf-8',newline='\n')
 (dest/'wp2-storage-structure.schema.json').write_text(json.dumps(schema,indent=2),encoding='utf-8',newline='\n')
 (dest/'wp2-storage-reference.md').write_text(md,encoding='utf-8',newline='\n')
 standalone=re.sub(r'@font-face\s*\{[^}]*\}',lambda m:m[0]if'data:'in m[0]else'',html)
 standalone=standalone.replace('href="/devices/cmf-watch-pro-2/internals/storage/"', 'href="https://cmf.arnv.dev/devices/cmf-watch-pro-2/internals/storage/"')
 (dest/'wp2-storage-viewer.html').write_text(standalone,encoding='utf-8',newline='\n')
 assert "url('./assets/mono.ttf')" not in standalone
 return {'nodes':len(data['nodes']),'stableIdsUnique':len({x['id']for x in data['nodes']})==len(data['nodes']),'rangesAndParentSumsValid':True,'files':[p.name for p in dest.iterdir()if p.is_file()]}
