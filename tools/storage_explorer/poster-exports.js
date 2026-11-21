/* Standalone SVG/PNG poster export. No network or third-party renderer. */
async function exportPoster(format){
 await document.fonts.ready;
 const scope=$('poster-scope').value,whole=scope==='all',node=whole?ROOT:current;
 const width=format==='png'?Number($('poster-width').value):4096,baseW=4096,baseH=whole?4200:3000;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 svg.setAttribute('xmlns',ns);svg.setAttribute('width',width);svg.setAttribute('height',Math.round(width*baseH/baseW));svg.setAttribute('viewBox',`0 0 ${baseW} ${baseH}`);
 function add(tag,attrs={},text,parent=svg){const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;parent.append(e);return e}
 add('title',{},'CMF Watch Pro 2 storage — '+(whole?'whole device':node.name));
 add('desc',{},'Storage reference based on stock firmware 1.0.0.73 and independently verified hardware evidence. NAND and NOR panels use independent scales. Physical adjacency and factory free space are not implied.');
 add('metadata',{},JSON.stringify({format:'fmc-storage-poster',version:1,scope,region:node.name,reference:structureExport,fontLicense:JSON.parse($('font-license').textContent)}));
 const fontRule=document.querySelector('style').textContent.match(/@font-face\s*\{[^}]*\}/)?.[0]||'';add('style',{},fontRule+'\ntext{font-family:"Reference Mono",monospace;font-weight:500}');
 const measure=document.createElement('canvas').getContext('2d');
 function text(x,y,value,size=24,fill='#e6eaf1',weight=500,maxWidth){let label=String(value);if(maxWidth){measure.font=`${weight} ${size}px "Reference Mono"`;while(label.length>1&&measure.measureText(label).width>maxWidth)label=label.slice(0,-2)+'…'}return add('text',{x,y,fill,'font-size':size,'font-weight':weight},label)}
 add('rect',{width:baseW,height:baseH,fill:'#11151b'});
 text(64,100,'CMF / WATCH PRO 2 STORAGE',48,'#f0f3f8',600);text(64,153,whole?'Whole device · stock firmware 1.0.0.73':'Current region · '+ancestors(node).map(n=>n.name).join(' / '),25,'#b3c0d3',500,baseW-128);
 text(64,201,whole?'128 MiB NAND main area + 4 MiB NOR · not a factory-state dump':size(node.bytes)+' · '+status(node),24,'#b3c0d3',500,baseW-128);
 const maxDepth=$('poster-detail').value==='files'?8:Number($('depth').value);
 function paint(parent,x,y,w,h,depth=0){const kids=parent.children||[];for(const box of squarify(kids,w,h)){
  const n=box.n,xx=x+box.x+1,yy=y+box.y+1,ww=Math.max(0,box.w-2),hh=Math.max(0,box.h-2);if(!ww||!hh)continue;
  const g=add('g');add('title',{},n.name+' · '+bytes(n.bytes)+' bytes · '+status(n)+'\n'+(n.note||''),g);
  const group=n.children&&depth<maxDepth&&ww>80&&hh>70;
  add('rect',{x:xx,y:yy,width:ww,height:hh,fill:group?'#1e2632':color(n),stroke:'#11151b','stroke-width':1},undefined,g);
  if(group){const header=Math.min(36,hh*.18);if(ww>145&&header>18){text(xx+9,yy+header*.75,n.name+' · '+size(n.bytes),Math.min(24,header*.65),'#e5edfa',600,ww-18)}paint(n,xx+3,yy+header+2,ww-6,hh-header-5,depth+1)}
  else if(ww>118&&hh>67){text(xx+12,yy+33,n.name,25,'#fff',600,ww-24);text(xx+12,yy+61,size(n.bytes),22,'#ecf1fa',500,ww-24)}
 }}
 if(whole){text(64,255,'NAND · 128 MiB',30,'#fff',600);paint(ROOT.children[0],64,278,baseW-128,2620);text(64,2980,'NOR · 4 MiB · detail panel',30,'#fff',600);paint(ROOT.children[1],64,3004,baseW-128,770)}
 else paint(node.children?node:{children:[node]},64,250,baseW-128,2260);
 const legendY=whole?3850:2600;let lx=64,ly=legendY;for(const kind of ['faces','animations','fonts','artwork','resources','firmware','filesystem','metadata','reserved','unknown']){
  if(lx>baseW-700){lx=64;ly+=52}add('rect',{x:lx,y:ly-21,width:22,height:22,fill:KINDS[kind][1]});text(lx+34,ly,KINDS[kind][0],22);lx+=490;
 }
 text(64,baseH-150,'Areas are proportional within each panel; headers and borders are excluded.',23,'#aab8cc');
 text(64,baseH-108,whole?'NAND and NOR panels scale independently. The 123 MiB logical NAND view is not extra physical capacity.':'NAND logical and physical offsets are different address spaces. Small entries remain in the JSON reference.',23,'#aab8cc',500,baseW-128);
 text(64,baseH-66,'Stock files, device observations and driver findings remain separate. Unverified contents are not classified as free.',22,'#aab8cc',500,baseW-128);
 const source='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(svg),slug=whole?'whole-device':node.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 if(format==='svg'){downloadFile('wp2-storage-'+slug+'.svg',source,'image/svg+xml;charset=utf-8');return}
 const url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml'}));
 try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Could not render the SVG poster. SVG export remains available.'));img.src=url});const canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.round(width*baseH/baseW);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG export could not be created.')),'image/png'));downloadFile('wp2-storage-'+slug+'.png',blob,'image/png');canvas.width=0;canvas.height=0}finally{URL.revokeObjectURL(url)}
}
