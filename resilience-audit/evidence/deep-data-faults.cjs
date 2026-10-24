// Exact source modules transpiled for fault injection; UI rendering is inferred separately.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const Big = require('big.js');
const root = path.resolve(__dirname, '..');
const report = {generatedAt: new Date().toISOString(), observationMs: 100, checks: [], scope: 'Source function and installed transport fault injection; not a browser route test'};
const rq = require('@tanstack/react-query');
const utils = {VDOT_ASSET_ID:'15', WSTETH_ASSET_ID:'1000190', SUSDE_ASSET_ID:'1000695', SUSDS_ASSET_ID:'1000700', JITOSOL_ASSET_ID:'1000752', APYUSD_ASSET_ID:'1000830', PRIME_ASSET_ID:'1000540', createQueryString: o => '?' + new URLSearchParams(o), createZustandStorage: o => o};
const stubs = {'@galacticcouncil/utils':utils, '@galacticcouncil/money-market/ui-config':{PRIME_APY:0.1}, 'zustand/middleware':{persist: f=>f}, '@/utils/consts':{STALE_TIME:3600000,GC_TIME:86400000}};
const cache = new Map();
function load(relative, extra={}) {
  const absolute = path.join(root, relative);
  if(cache.has(absolute)) return cache.get(absolute).exports;
  const source = fs.readFileSync(absolute, 'utf8');
  const output = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const module = {exports:{}}; cache.set(absolute, module);
  const localRequire = spec => {
    if(spec in extra) return extra[spec];
    if(spec in stubs) return stubs[spec];
    if(spec==='@/states/externalApy') return load('apps/main/src/states/externalApy.ts');
    if(spec==='.') return load('packages/indexer/src/neckwork/index.ts', { './accounts':{},'./dca':{},'./fees':{},'./intents':{},'./money-market':{},'./pools':{},'./prices':{},'./stats':{},'./trades':{} });
    return require(spec);
  };
  const fn=vm.runInThisContext('(function(require,module,exports){'+output+'\n})',{filename:absolute});
  fn(localRequire,module,module.exports); return module.exports;
}
async function observe(p) {
  let timeout;
  try { return await Promise.race([p.then(()=> 'resolved',()=> 'rejected'),new Promise(r=>timeout=setTimeout(()=>r('pending'),100))]); }
  finally {clearTimeout(timeout)}
}
function record(name, observation, implication) {report.checks.push({name,passed:true,observation,implication})}
async function main(){
 const originalFetch=global.fetch; const originalNow=Date.now;
 try {
  const kamino=load('apps/main/src/api/external/kamino.ts');
  const apyStore=load('apps/main/src/states/externalApy.ts');
  global.fetch=async()=>new Response(JSON.stringify([{createdOn:'stale-date',apr:'0',apy:'not-a-number'}]),{status:200});
  const malformed=await kamino.kaminoApyQuery('malformed-kamino','https://test.invalid/proxy').queryFn();
  assert(Number.isNaN(malformed)); assert(Number.isNaN(apyStore.getCachedExternalApy('malformed-kamino').apy));
  assert.throws(()=>Big(malformed), /Invalid number/);
  record('kamino-nonnumeric-string-cached-as-NaN',{result:'NaN',cache:'NaN',Big:'throws Invalid number'},'Invalid apy strings pass schema, poison cached results, and fail later Big conversions in render.');
  global.fetch=async()=>new Response(JSON.stringify([{createdOn:'2000-01-01',apr:'0',apy:'0.25'}]),{status:200});
  const stale=await kamino.kaminoApyQuery('stale-kamino','https://test.invalid/proxy').queryFn(); assert.equal(stale,25);
  record('kamino-stale-row-treated-as-current',{timestamp:'2000-01-01',result:stale},'No data freshness validation; cache TTL timestamps receipt rather than upstream sample.');
  global.fetch=async()=>{throw new Error('DNS outage')};
  const warm=await kamino.kaminoApyQuery('stale-kamino','https://test.invalid/proxy').queryFn(); assert.equal(warm,25);
  const cold=await kamino.kaminoApyQuery('cold-kamino','https://test.invalid/proxy').queryFn(); assert.equal(cold,null);
  Date.now=()=>originalNow()+8*86400000;
  const expired=await kamino.kaminoApyQuery('stale-kamino','https://test.invalid/proxy').queryFn(); assert.equal(expired,null); Date.now=originalNow;
  record('external-apy-cold-warm-and-expired-outage',{cold,warm,expired},'Thrown transport errors become null or <=7-day cache; helper resolves so outer React Query retries do not run.');
  let hasSignal;
  global.fetch=async(_url,init)=>{hasSignal=Boolean(init?.signal);return new Promise(()=>{})};
  const pending=await observe(kamino.kaminoApyQuery('stale-kamino','https://test.invalid/proxy').queryFn());assert.equal(pending,'pending');assert.equal(hasSignal,false);
  record('warm-apy-cache-not-used-until-hanging-fetch-settles',{pending,hasSignal},'A warm persisted fallback does not bound loading; no abort signal is supplied.');
  const defillama=load('apps/main/src/api/external/defillama.ts');
  global.fetch=async()=>new Response('{"data":[]}',{status:200});
  const empty=await defillama.defillamaLatestApyQuery('empty-defillama','https://test.invalid/proxy').queryFn();assert.equal(empty,0);
  record('defillama-empty-response-cached-as-zero',{empty,cached:apyStore.getCachedExternalApy('empty-defillama').apy},'Valid empty response replaces unavailable data with numeric zero.');
  const kraken=load('apps/main/src/api/external/kraken.ts');
  global.fetch=async()=>new Response(JSON.stringify({error:[],result:{NEARUSD:[[1,'bad','3','1','bad','1','2',5]],last:1}}),{status:200});
  const candles=await kraken.krakenOhlcQuery('NEARUSD',5).queryFn();assert(Number.isNaN(candles[0].close));
  record('kraken-NaN-close-is-successful-data',{close:'NaN',open:'NaN'},'String shape validation does not enforce numeric finite OHLC; portfolio Big(NaN.toString()) can throw.');
  const neckwork=load('packages/indexer/src/neckwork/index.ts', {'./accounts':{},'./dca':{},'./fees':{},'./intents':{},'./money-market':{},'./pools':{},'./prices':{},'./stats':{},'./trades':{}});
  for(const status of [200,404,429,503]){
    global.fetch=async()=>new Response(new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('{'))}}),{status,headers:{'content-type':'application/json'}});
    const client=neckwork.getNeckworkClient('https://test.invalid');
    const state=await observe(client.GET('/v1/status'));
    assert.equal(state,'pending');
    record('neckwork-body-hang-'+status,{status,state},status===200?'Successful body parsing has no deadline.':'Error middleware awaits clone.json before throwing status, so even HTTP errors can hang before reaching query fallback.');
  }
  global.fetch=async()=>new Response(JSON.stringify({tvl:{},volume24h:{}}),{status:200});
  const stats=load('packages/indexer/src/neckwork/stats.ts');
  const partial=await stats.platformStatsQuery(neckwork.getNeckworkClient('https://test.invalid')).queryFn();
  assert.equal(partial.omnipoolTvlNorm,undefined);assert.throws(()=>Big(partial.omnipoolVolNorm).plus(partial.stableswapVolNorm),/plus is not a function/);
  record('neckwork-missing-stats-values-pass-query',{mappedField:'undefined',headerVolume:'throws plus is not a function'},'Incomplete nested objects pass queryFn; header checks only !==null and uses Big(undefined).plus(...) during render.');
  global.fetch=async()=>new Response(JSON.stringify({error:{message:'unavailable'}}),{status:503});
  const client=neckwork.getNeckworkClient('https://test.invalid');
  await assert.rejects(client.GET('/v1/status'),err=>err.status===503 && err.name==='NeckworkApiError');
  record('neckwork-http-error-with-complete-body-rejects',{status:503,error:'NeckworkApiError'},'Middleware does catch ordinary complete HTTP failures at query boundary.');
  const {GraphQLClient}=await import('graphql-request');
  global.fetch=async()=>new Response(JSON.stringify({data:{events:[{args:{amountIn:'bad'}}]}}),{status:200,headers:{'content-type':'application/json'}});
  const graph=new GraphQLClient('https://test.invalid/graphql');
  const data=await graph.request('query Audit { events { args } }'); assert.equal(data.events[0].args.amountIn,'bad');
  record('graphql-business-data-not-validated',{amountIn:'bad',status:'successful GraphQL result'},'graphql-request validates GraphQL envelope, not numeric/semantic values required by render transformations.');
  const multisigSource=fs.readFileSync(path.join(root,'apps/main/src/providers/MultisigProvider.tsx'),'utf8');
  const multisigBody=multisigSource.match(/const multisigAddresses = useMemo\(\(\) => \{([\s\S]*?)\n  \}, \[/)[1];
  const deriveMultisigs=new Function('accountMultisigs','safeConvertPublicKeyToSS58',multisigBody);
  for(const accounts of [{},[null]]) {
    global.fetch=async()=>new Response(JSON.stringify({data:{accounts}}),{status:200,headers:{'content-type':'application/json'}});
    const malformedMultix=await graph.request('query MultisigsByAccountIds { accounts { pubKey } }');
    assert.throws(()=>deriveMultisigs(malformedMultix, key=>key),TypeError);
    record('multix-provider-malformed-accounts-'+(Array.isArray(accounts)?'null-item':'object'),{graphqlResult:malformedMultix,globalProvider:'throws TypeError'},'Exact global MultisigProvider useMemo body throws outside React Query; connected account required, global tree impact follows root placement (browser boundary outcome not tested).');
  }
  let graphSignal;
  global.fetch=async(_url,init)=>{graphSignal=Boolean(init?.signal);return new Promise(()=>{})};
  assert.equal(await observe(graph.request('query Audit { events { args } }')),'pending');assert.equal(graphSignal,false);
  record('graphql-hang-with-no-client-signal',{state:'pending',hasSignal:graphSignal},'UI SDK clients instantiate with no deadline and query wrappers do not pass React Query signal.');
  report.completed=true;
 } finally {global.fetch=originalFetch;Date.now=originalNow}
}
main().then(()=>{fs.writeFileSync(path.join(__dirname,'deep-data-faults.json'),JSON.stringify(report,null,2)+'\n');console.log(report.checks.length+' source/transport checks confirmed')},e=>{report.completed=false;report.error=String(e.stack||e);fs.writeFileSync(path.join(__dirname,'deep-data-faults.json'),JSON.stringify(report,null,2)+'\n');console.error(e);process.exitCode=1});
