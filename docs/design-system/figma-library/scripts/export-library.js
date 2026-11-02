// Read-only Figma Plugin API exporter. Prepend:
// const CONFIG = { mode: 'page', pageId: '34:2', offset: 0 };
// mode='foundations' exports variables and styles. Returned LZW/base64 chunks
// avoid the connector's 48 KB response limit. Use assemble_catalog.py to decode.
const SOURCE_FILE = 'wN5pnsm2FPVoCrxFNEAlYl';
function clean(value) {
  return JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'symbol' ? null : v));
}
function layout(n) {
  const result = {};
  for (const field of ['x','y','width','height','minWidth','minHeight','maxWidth','maxHeight',
    'layoutMode','layoutWrap','primaryAxisSizingMode','counterAxisSizingMode',
    'primaryAxisAlignItems','counterAxisAlignItems','layoutSizingHorizontal',
    'layoutSizingVertical','layoutPositioning','layoutGrow','layoutAlign',
    'paddingTop','paddingRight','paddingBottom','paddingLeft','itemSpacing',
    'counterAxisSpacing','constraints','constrainProportions','clipsContent',
    'cornerRadius','strokeWeight','strokeAlign']) {
    if (field in n) result[field] = n[field];
  }
  return clean(result);
}
function path(n) {
  const list = []; let p = n.parent;
  while (p && p.type !== 'DOCUMENT') {
    list.unshift({id:p.id, name:p.name, type:p.type}); p = p.parent;
  }
  return list;
}
function styles(n) {
  const result = {};
  for (const key of ['fillStyleId','strokeStyleId','effectStyleId','textStyleId']) {
    if (key in n && typeof n[key] === 'string' && n[key]) result[key] = n[key];
  }
  return result;
}
function bindings(n) {
  const result = {};
  if (n.boundVariables && Object.keys(n.boundVariables).length) result.node = n.boundVariables;
  for (const key of ['fills','strokes','effects','layoutGrids']) {
    if (!(key in n) || !Array.isArray(n[key])) continue;
    const bound = n[key].map((p, index) => p.boundVariables && Object.keys(p.boundVariables).length
      ? {index, bindings:p.boundVariables} : null).filter(Boolean);
    if (bound.length) result[key] = bound;
  }
  return clean(result);
}
function visible(n) {
  let p = n;
  while (p && p.type !== 'DOCUMENT') {if ('visible' in p && !p.visible) return false; p = p.parent;}
  return true;
}
function owned(n, out = []) {
  if (!('children' in n)) return out;
  for (const c of n.children) {out.push(c); if (c.type !== 'INSTANCE') owned(c, out);}
  return out;
}
async function dependency(instance) {
  const main = await instance.getMainComponentAsync();
  if (!main) return {id:null, name:instance.name, unresolved:true};
  const owner = main.parent?.type === 'COMPONENT_SET' ? main.parent : null;
  return {id:main.id,key:main.key,name:main.name,remote:main.remote,
    ownerId:owner?.id,ownerKey:owner?.key,ownerName:owner?.name};
}
async function inspect(n, includeLayers) {
  const descendants = owned(n), dependencies = [], layers = [], bound = [], styleRefs = [];
  for (const layer of [n, ...descendants]) {
    const refs = clean(layer.componentPropertyReferences || {}), b = bindings(layer), st = styles(layer);
    if (Object.keys(b).length) bound.push({nodeId:layer.id,name:layer.name,bindings:b});
    if (Object.keys(st).length) styleRefs.push({nodeId:layer.id,name:layer.name,styles:st});
    let main;
    if (layer.type === 'INSTANCE') {main = await dependency(layer); dependencies.push({...main,instanceId:layer.id,instanceName:layer.name});}
    const immediate = layer.parent?.id === n.id;
    if (includeLayers && layer.id !== n.id && (layer.type === 'INSTANCE' || layer.type === 'TEXT' || immediate ||
        Object.keys(refs).length || Object.keys(b).length || Object.keys(st).length)) {
      const localPath=[];let parent=layer.parent;while(parent&&parent.id!==n.id){localPath.unshift(parent.name);parent=parent.parent;}
      const item = {id:layer.id,name:layer.name,type:layer.type,path:localPath,
        visible:visible(layer),layout:layer.type==='FRAME'||layer.type==='INSTANCE'?layout(layer):
          clean({x:layer.x,y:layer.y,width:layer.width,height:layer.height,constraints:layer.constraints}),
        propertyReferences:refs,boundVariables:b,styleIds:st};
      if (main) {item.mainComponent = main; item.componentProperties = clean(layer.componentProperties);}
      if (layer.type === 'TEXT') {item.characters = layer.characters; item.fontName = clean(layer.fontName); item.fontSize = clean(layer.fontSize);}
      layers.push(item);
    }
  }
  return {dependencies,layers,usedBindings:bound,usedStyles:styleRefs,ownedLayerCount:descendants.length};
}
let data;
if (CONFIG.mode === 'foundations') {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const [text,paint,effect,grid] = await Promise.all([
    figma.getLocalTextStylesAsync(),figma.getLocalPaintStylesAsync(),
    figma.getLocalEffectStylesAsync(),figma.getLocalGridStylesAsync()]);
  const style = s => {
    const out = {id:s.id,key:s.key,name:s.name,type:s.type,description:s.description,remote:s.remote};
    for (const k of ['fontName','fontSize','lineHeight','letterSpacing','textCase','textDecoration',
      'paragraphSpacing','paragraphIndent','listSpacing','hangingPunctuation','hangingList',
      'paints','effects','layoutGrids']) if (k in s) out[k] = s[k];
    return clean(out);
  };
  data = {fileKey:SOURCE_FILE,collections:collections.map(c=>({id:c.id,key:c.key,name:c.name,
    remote:c.remote,modes:c.modes,defaultModeId:c.defaultModeId,variableIds:c.variableIds})),
    variables:variables.map(v=>clean({id:v.id,key:v.key,name:v.name,description:v.description,
      collectionId:v.variableCollectionId,remote:v.remote,resolvedType:v.resolvedType,
      valuesByMode:v.valuesByMode,scopes:v.scopes,codeSyntax:v.codeSyntax,
      hiddenFromPublishing:v.hiddenFromPublishing})),
    styles:{text:text.map(style),paint:paint.map(style),effect:effect.map(style),grid:grid.map(style)}};
} else {
  const page = await figma.getNodeByIdAsync(CONFIG.pageId);
  await figma.setCurrentPageAsync(page);
  const all = page.findAllWithCriteria({types:['COMPONENT_SET','COMPONENT']});
  const families = all.filter(n=>n.type==='COMPONENT_SET'||n.parent.type!=='COMPONENT_SET');
  const variants = all.filter(n=>n.type==='COMPONENT'&&n.parent.type==='COMPONENT_SET');
  const info = n=>({id:n.id,name:n.name,type:n.type,parentId:n.parent.id,visible:visible(n),layout:layout(n)});
  const containers = new Map();
  for (const c of families) {let n=c.parent;while(n&&n.type!=='PAGE'){
    if (!['COMPONENT','COMPONENT_SET','INSTANCE'].includes(n.type)) containers.set(n.id,n);n=n.parent;}}
  data = {fileKey:SOURCE_FILE,page:{id:page.id,name:page.name},roots:page.children.map(info),
    containers:[...containers.values()].map(info),
    counts:{sets:families.filter(n=>n.type==='COMPONENT_SET').length,
      standalone:families.filter(n=>n.type==='COMPONENT').length,variants:variants.length,total:all.length},
    components:[],variants:[]};
  for (const n of families) {
    const representative = n.type==='COMPONENT_SET' ? n.children.find(c=>c.type==='COMPONENT') : n;
    const detail = representative ? await inspect(representative,true) : {layers:[],dependencies:[]};
    data.components.push({...info(n),key:n.key,kind:n.type==='COMPONENT_SET'?'component_set':'standalone',
      pageId:page.id,pageName:page.name,path:path(n),description:n.description,remote:n.remote,
      properties:clean(n.componentPropertyDefinitions),exportSettings:clean(n.exportSettings),
      representativeId:representative?.id,layerInspection:'representative-definition',...detail});
  }
  for (const n of variants) {
    data.variants.push({...info(n),key:n.key,kind:'variant',ownerId:n.parent.id,pageId:page.id,
      pageName:page.name,variantProperties:clean(n.variantProperties),remote:n.remote,
      exportSettings:clean(n.exportSettings),bindings:bindings(n),styles:styles(n),
      dependencyInspection:'See owner family representative; this variant was inventoried, not behavior-tested.',
      children:n.children.map(c=>({id:c.id,name:c.name,type:c.type,visible:c.visible,
        layout:clean({x:c.x,y:c.y,width:c.width,height:c.height,constraints:c.constraints,
          constrainProportions:c.constrainProportions,clipsContent:c.clipsContent}),
        propertyReferences:clean(c.componentPropertyReferences||{})}))});
  }
}
// LZW over UTF-8 bytes, unsigned 16-bit big-endian codes; 65535 resets dictionary.
const json = JSON.stringify(data);
let bytes = '';
for (const char of json) {
  const c=char.codePointAt(0);
  if(c<128)bytes+=String.fromCharCode(c);
  else if(c<2048)bytes+=String.fromCharCode(192|(c>>6),128|(c&63));
  else if(c<65536)bytes+=String.fromCharCode(224|(c>>12),128|((c>>6)&63),128|(c&63));
  else bytes+=String.fromCharCode(240|(c>>18),128|((c>>12)&63),128|((c>>6)&63),128|(c&63));
}
let dict=new Map(),next=256,w='';const codes=[];
function emit(s){codes.push(s.length===1?s.charCodeAt(0):dict.get(s));}
for(const c of bytes){const wc=w+c;if(w===''||dict.has(wc)){w=wc;continue;}emit(w);
  if(next<65535)dict.set(wc,next++);else{codes.push(65535);dict=new Map();next=256;}w=c;}
if(w)emit(w);
const binary=new Uint8Array(codes.length*2);for(let i=0;i<codes.length;i++){binary[2*i]=codes[i]>>8;binary[2*i+1]=codes[i]&255;}
const payload=figma.base64Encode(binary),offset=CONFIG.offset||0,size=44000;
return {codec:'lzw16be-utf8-v1',pageId:CONFIG.pageId||null,mode:CONFIG.mode||'page',
  offset,nextOffset:offset+size<payload.length?offset+size:null,totalLength:payload.length,
  jsonLength:json.length,counts:data.counts||{variables:data.variables.length,styles:data.styles.text.length+data.styles.effect.length},
  data:payload.slice(offset,offset+size)};
