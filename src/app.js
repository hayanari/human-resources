// ─── STATE ───
let emps=[], evals=[], photoMap={};
let pendingExcel=null, pendingPhotos=[];
let editEmpId=null, editEvalIdx=null;
let loadedFile='社員データ.xlsx';

// ─── DEFAULT DATA ───
const DEFAULT_COMP=[
  {cat:'全社共通',name:'社会性',detail:'組織のルールやマナーを守り、円滑な人間関係を築く力',coef:2,levels:['挨拶や礼儀ができたりできなかったりする。遅刻や締切遅れが目立つ。','挨拶や礼儀ができるが意識しないと抜けることがある。社外では意識が薄れがち。','上司のサポートのもと社内外で適切な振る舞いができる。基本的なマナーを身につけつつある。','ある程度一人で社内外ともにふさわしい振る舞いができる。ビジネスマナーを理解し適切な言葉遣いや態度をとれる。']},
  {cat:'全社共通',name:'コミュニケーション力',detail:'チームとして適切なコミュニケーションをとり、会社の方針に沿って行動する力',coef:2,levels:['自分本位な行動が多く周囲と協力できたりできなかったりする。','受け身の姿勢が強く主体的に関わろうとしない。','上司のサポートのもと周囲と適切なコミュニケーションが取れる。','主体的にチームと連携しながら業務を進められる。']},
  {cat:'全社共通',name:'責任性',detail:'業務上の自分の責任範囲を明確に把握し、最後まで責任をもって業務に取り組む力',coef:2,levels:['責任範囲を理解しておらず指示されないと動けない。','指示があれば業務を遂行するが責任を強く意識しているわけではない。','自分の責任範囲を理解し上司のサポートのもと業務を完遂できる。','責任範囲をしっかり認識し最後まで業務をやり遂げられる。']},
  {cat:'職種共通',name:'技術力・安全意識・作業効率',detail:'施工技術・専門知識の習得度、安全管理・リスク回避の意識、時間管理・段取りの良さ',coef:2,levels:['基本的な作業をこなせず指示がないと動けない。安全ルールを守らず事故リスクが高い。','指示があれば基本的な作業を行えるがミスが多い。安全対策の意識が低い。','上司のサポートのもと標準的な作業をこなせる。適切な安全管理ができる。','一通りの施工作業をミスなくこなせる。安全ルールを守り他者にも注意喚起できる。']},
  {cat:'役職共通',name:'判断力',detail:'突発的または複雑・困難な課題・問題に対し、適切に判断し措置・対応を決定できる能力',coef:2,levels:['指示がないと業務を進められずミスが多い。','指示があれば業務をこなせるが効率性に欠ける。','決められた業務を正確に遂行し適切な報告ができる。','日常業務の改善を考え先輩や上司に相談しながら実行できる。']},
];
const DEFAULT_KPI=[
  {name:'施工技術の向上',detail:'現場作業（工種）の習得',target:'評価者と面談の上、各工法等のスキルマップの業務を１つ習得する。目標工法：内面補修スキル',coef:4,levels:['各工法を構成するスキル項目を1つも習得できない。','スキル項目を1つ習得。','スキル項目を2つ習得。','各工法を構成する業務を1つ習得。','業務を2つ以上習得。']},
  {name:'車両・備品管理',detail:'車両清掃、月次メンテナンス、備品チェックの実施と報告',target:'自身が担当する車両の日次清掃・月次メンテナンスの実施。車両備品の状態を確認し、異常があれば報告する。',coef:4,levels:['清掃・報告・点検の未実施や誤りが頻発する。','一部で報告漏れや未実施が見られる。','毎日の清掃と報告、月次メンテナンスを基本的に漏れなく実施。','日々の清掃・報告を継続的に行い月次点検も実施済。','清掃・点検・報告を毎回正確・丁寧に実施。']},
  {name:'資格取得',detail:'1級土木施工管理技士試験',target:'上期：1次試験を自己採点で合格。下期：1次・2次試験に正式に合格する。',coef:2,levels:['不合格','','','','合格']},
  {name:'報連相',detail:'適切なタイミングで正確に伝えることができるか',target:'上司や関係者への報告・連絡・相談を漏れなく実施し業務を円滑に進める。',coef:2,levels:['報連相が極めて不十分で業務に支障が出ている。','タイミングが遅れるまたは抜け漏れがある。','必要な報告・連絡・相談を実施している。','指示されずとも必要なタイミングで実施できる。','常に先回りして報連相ができ状況変化に即応できる。']},
];
const DEFAULT_SKILLS=['施工管理','測量','AutoCAD','安全管理','品質管理','原価管理','工程管理','コミュニケーション','報連相','English'];
let compItems=JSON.parse(localStorage.getItem('hr-comp')||'null')||JSON.parse(JSON.stringify(DEFAULT_COMP));
let kpiItems=JSON.parse(localStorage.getItem('hr-kpi')||'null')||JSON.parse(JSON.stringify(DEFAULT_KPI));
let skillItems=JSON.parse(localStorage.getItem('hr-skills')||'null')||[...DEFAULT_SKILLS];
const RANKS=[{r:'D-',min:0,max:35},{r:'D',min:36,max:45},{r:'C-',min:46,max:50},{r:'C',min:51,max:55},{r:'B',min:56,max:60},{r:'B+',min:61,max:65},{r:'A',min:66,max:70},{r:'A+',min:71,max:75},{r:'S',min:76,max:85},{r:'S+',min:86,max:999}];
const HOUBOU=[-3,-2,-1,0,1,2,3,4,5,6];
function calcFS(v){
  if(!v)return 0;
  let compTotal=0,compCount=0;
  for(let i=0;i<compItems.length;i++){
    const s1=(v.compScores||{})[i*2]||0;
    const s2=(v.compScores||{})[i*2+1]||0;
    if(s1>0||s2>0){
      compTotal+=(s1+s2)/2*compItems[i].coef;
      compCount++;
    }
  }
  let kpiTotal=0,kpiCount=0;
  for(let i=0;i<kpiItems.length;i++){
    const s0=(v.kpiScores||{})[i*3]||0;
    const s1=(v.kpiScores||{})[i*3+1]||0;
    const s2=(v.kpiScores||{})[i*3+2]||0;
    if(s0>0||s1>0||s2>0){
      kpiTotal+=((s0+s1+s2)/3)*kpiItems[i].coef;
      kpiCount++;
    }
  }
  const compScore=compCount?compTotal:0;
  const kpiScore=kpiCount?kpiTotal:0;
  return Math.round(compScore*0.6+kpiScore*0.4);
}

function calcRank(sc){const s=Math.round(sc||0);for(let i=0;i<RANKS.length;i++)if(s>=RANKS[i].min&&s<=RANKS[i].max)return{rank:RANKS[i].r,houbou:HOUBOU[i],idx:i};return{rank:'—',houbou:0,idx:-1};}

// ─── UTIL ───
function fmtD(v){if(!v)return'';if(v instanceof Date){return`${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`;}if(typeof v==='number'){const d=new Date(Math.round((v-25569)*86400000));return`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;}return String(v).trim().replace(/\//g,'-');}
function today0(){const d=new Date();d.setHours(0,0,0,0);return d;}
function tenureYears(joined){if(!joined)return 0;return Math.floor((new Date()-new Date(joined))/86400000/365.25);}
function certStatus(expiry){if(!expiry)return null;const diff=Math.floor((new Date(expiry)-today0())/86400000);if(diff<0)return{type:'expired',badge:`<span class="sbdg sb-x"><span class="sdot" style="background:var(--d)"></span>期限切れ</span>`};if(diff<=30)return{type:'expiring',badge:`<span class="sbdg sb-e"><span class="sdot" style="background:var(--w)"></span>${diff}日後</span>`};return{type:'valid',badge:`<span class="sbdg sb-v"><span class="sdot" style="background:var(--g)"></span>有効</span>`};}
function toast(msg,type=''){const c=document.getElementById('toast-c');const t=document.createElement('div');t.className=`toast${type?' '+type:''}`;t.textContent=msg;c.appendChild(t);setTimeout(()=>{t.style.cssText='opacity:0;transform:translateX(20px);transition:.3s';setTimeout(()=>t.remove(),300);},3200);}
function openMo(id){document.getElementById(id).classList.add('open');}
function closeMo(id){document.getElementById(id).classList.remove('open');}
function getPhoto(id){return photoMap[id]||null;}
function avHTML(e,cls){const ph=getPhoto(e.id);if(ph)return`<div class="${cls}"><img src="${ph}"></div>`;return`<div class="${cls}">${(e.name||'?').charAt(0)}</div>`;}
function getAlerts(){const td=today0();const a=[];emps.forEach(e=>(e.certs||[]).forEach(c=>{if(!c.expiry)return;const diff=Math.floor((new Date(c.expiry)-td)/86400000);if(diff<0)a.push({e,c,type:'expired',msg:`${e.name}（${e.dept}）：「${c.name}」期限切れ（${c.expiry}）`});else if(diff<=30)a.push({e,c,type:'expiring',msg:`${e.name}（${e.dept}）：「${c.name}」まで${diff}日（${c.expiry}）`});}));return a;}
function updBadge(){const n=getAlerts().length;const b=document.getElementById('alert-badge');b.textContent=n;b.style.display=n?'inline-block':'none';}
function renderAlerts(id){const al=getAlerts(),el=document.getElementById(id);if(!al.length){el.innerHTML='';return;}el.innerHTML=`<div class="al-banner"><div class="al-ico">⚠️</div><div><div class="al-title">資格・有効期限アラート（${al.length}件）</div>${al.map(a=>`<div class="al-item"><div class="al-dot ${a.type==='expired'?'dr':'dy'}"></div>${a.msg}</div>`).join('')}</div></div>`;}

// ─── SUPABASE ───
function sb(){return window.supabaseClient;}
function empToRow(e){return{id:e.id,name:e.name,belong:e.belong||null,dept:e.dept||null,position:e.position||null,job_type:e.jobType||null,grade:e.grade||null,goubou:e.goubou||null,email:e.email||null,phone:e.phone||null,joined:e.joined||null,dob:e.dob||null,zip:e.zip||null,address:e.address||null,name_changed:e.nameChanged||null,address_changed:e.addressChanged||null,skills:e.skills||[],notes:e.notes||null,certs:e.certs||[],grade_history:e.gradeHistory||[],transfer_history:e.transferHistory||[],skill_levels:e.skillLevels||{}};}
function rowToEmp(r){return{id:r.id,name:r.name,belong:r.belong||'',dept:r.dept||'',position:r.position||'',jobType:r.job_type||'',grade:r.grade||'',goubou:r.goubou||'',email:r.email||'',phone:r.phone||'',joined:r.joined||'',dob:r.dob||'',zip:r.zip||'',address:r.address||'',nameChanged:r.name_changed||'',addressChanged:r.address_changed||'',skills:r.skills||[],notes:r.notes||'',certs:r.certs||[],gradeHistory:r.grade_history||[],transferHistory:r.transfer_history||[],skillLevels:r.skill_levels||{}};}
function evalToRow(v){return{emp_id:v.empId,period:v.period||null,satei:v.satei||null,eval_1st:v.eval1st||null,eval_2nd:v.eval2nd||null,comment:v.comment||null,comp_scores:v.compScores||{},kpi_scores:v.kpiScores||{}};}
function rowToEval(r){const v={empId:r.emp_id,period:r.period||'',satei:r.satei||'',eval1st:r.eval_1st||'',eval2nd:r.eval_2nd||'',comment:r.comment||'',compScores:r.comp_scores||{},kpiScores:r.kpi_scores||{}};if(r.id)v.id=r.id;return v;}
async function loadFromSupabase(){if(!sb())return false;try{const {data:eData,error:eErr}=await sb().from('employees').select('*');if(eErr)throw eErr;const {data:vData,error:vErr}=await sb().from('evaluations').select('*');if(vErr)throw vErr;emps=(eData||[]).map(rowToEmp);evals=(vData||[]).map(rowToEval);return true;}catch(err){console.error('Supabase load error:',err);return false;}}
async function syncToSupabase(){if(!sb())return;try{const {data:existEmps}=await sb().from('employees').select('id');if(existEmps?.length){const ids=existEmps.map(r=>r.id);await sb().from('employees').delete().in('id',ids);}for(const e of emps){const {error}=await sb().from('employees').insert(empToRow(e));if(error)throw error;}for(const v of evals){const {data,error}=await sb().from('evaluations').insert(evalToRow(v)).select('id').single();if(error)throw error;if(data)v.id=data.id;}toast('Supabaseにアップロードしました','suc');}catch(err){console.error('Supabase sync error:',err);toast('Supabaseアップロードに失敗: '+err.message,'err');}}
async function saveEmpToSupabase(rec){if(!sb())return;try{const {error}=await sb().from('employees').upsert(empToRow(rec),{onConflict:'id'});if(error)throw error;}catch(err){console.error('Supabase saveEmp error:',err);toast('Supabase保存に失敗','err');}}
async function delEmpFromSupabase(id){if(!sb())return;try{const {error}=await sb().from('employees').delete().eq('id',id);if(error)throw error;}catch(err){console.error('Supabase delEmp error:',err);}}
async function saveEvalToSupabase(v){if(!sb())return;try{if(v.id){const {error}=await sb().from('evaluations').update({period:v.period,satei:v.satei,eval_1st:v.eval1st,eval_2nd:v.eval2nd,comment:v.comment,comp_scores:v.compScores||{},kpi_scores:v.kpiScores||{}}).eq('id',v.id);if(error)throw error;}else{const {data,error}=await sb().from('evaluations').insert(evalToRow(v)).select('id').single();if(error)throw error;if(data)v.id=data.id;}}catch(err){console.error('Supabase saveEval error:',err);toast('Supabase評価保存に失敗','err');}}
async function delEvalFromSupabase(v){if(!sb()||!v.id)return;try{const {error}=await sb().from('evaluations').delete().eq('id',v.id);if(error)throw error;}catch(err){console.error('Supabase delEval error:',err);}}

// ─── NAV ───
const PAGE_TITLES={dashboard:'ダッシュボード',employees:'人材情報',org:'組織図',certs:'資格管理',skillmap:'スキルマップ',evaluation:'人事評価','eval-settings':'評価項目設定','labor-cost':'労務コスト管理',analytics:'活躍分析・採用',placement:'最適配置',attrition:'離職抑止・分析',detail:'社員詳細'};

function compIH(v){
  return v||'';
}
function nav(pg){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));document.getElementById('page-'+pg).classList.add('active');document.getElementById('page-title').textContent=PAGE_TITLES[pg]||pg;const idx={dashboard:0,employees:1,org:2,certs:3,skillmap:4,evaluation:5,'eval-settings':6,'labor-cost':7,analytics:8,placement:9,attrition:10};const items=document.querySelectorAll('.sb-item');if(idx[pg]!==undefined)items[idx[pg]].classList.add('active');({dashboard:renderDash,employees:renderEmps,org:renderOrg,certs:renderCerts,skillmap:renderSkillMap,evaluation:renderEvalList,'eval-settings':renderEvalSettings,'labor-cost':renderLaborCost,analytics:renderAnalytics,placement:renderPlacement,attrition:renderAttrition})[pg]?.();}

// ─── LOAD ───
function openLoadModal(){pendingExcel=null;pendingPhotos=[];document.getElementById('ex-lbl').innerHTML=`<div style="font-size:24px;margin-bottom:5px">📋</div><div style="font-weight:700;color:var(--p);font-size:13px">社員データ.xlsx を選択</div><div style="font-size:11.5px;color:var(--txm);margin-top:3px">.xlsx / .xls</div>`;document.getElementById('ph-lbl').innerHTML=`<div style="font-size:24px;margin-bottom:5px">🗂</div><div style="font-weight:700;color:var(--p);font-size:13px">顔写真を複数選択</div><div style="font-size:11.5px;color:var(--txm);margin-top:3px">EMP001.jpg のように命名</div>`;['ex-drop','ph-drop'].forEach(id=>document.getElementById(id).classList.remove('loaded'));document.getElementById('ld-status').style.display='none';const btn=document.getElementById('do-load-btn');btn.disabled=true;btn.style.opacity='.5';btn.textContent='読み込む';openMo('load-mo');}
function onExcelSel(ev){const f=ev.target.files[0];if(!f)return;pendingExcel=f;document.getElementById('ex-lbl').innerHTML=`<div style="font-size:24px;margin-bottom:5px">✅</div><div style="font-weight:700;color:var(--g);font-size:13px">${f.name}</div>`;document.getElementById('ex-drop').classList.add('loaded');updLdSt();ev.target.value='';}
function onPhotosSel(ev){const fs=Array.from(ev.target.files);if(!fs.length)return;pendingPhotos=fs;document.getElementById('ph-lbl').innerHTML=`<div style="font-size:24px;margin-bottom:5px">✅</div><div style="font-weight:700;color:var(--g);font-size:13px">${fs.length}枚</div>`;document.getElementById('ph-drop').classList.add('loaded');updLdSt();ev.target.value='';}
function updLdSt(){document.getElementById('ld-status').style.display='block';document.getElementById('ld-ex-st').innerHTML=pendingExcel?`<span style="color:var(--g)">✅ Excel：${pendingExcel.name}</span>`:`<span style="color:var(--txm)">⬜ Excel：未選択</span>`;document.getElementById('ld-ph-st').innerHTML=pendingPhotos.length?`<span style="color:var(--g)">✅ 顔写真：${pendingPhotos.length}枚</span>`:`<span style="color:var(--txl)">⬜ 顔写真：未選択（省略可）</span>`;const btn=document.getElementById('do-load-btn');btn.disabled=!pendingExcel;btn.style.opacity=pendingExcel?'1':'.5';}
function doLoad(){if(!pendingExcel)return;const btn=document.getElementById('do-load-btn');btn.textContent='読み込み中...';btn.disabled=true;if(pendingPhotos.length){photoMap={};let done=0;pendingPhotos.forEach(f=>{const id=f.name.replace(/\.[^.]+$/,'').trim();const r=new FileReader();r.onload=e=>{photoMap[id]=e.target.result;if(++done===pendingPhotos.length)loadExcelFile(pendingExcel);};r.readAsDataURL(f);});}else{photoMap={};loadExcelFile(pendingExcel);}}
function loadExcelFile(file){loadedFile=file.name;const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:'binary',cellDates:true});const ws1=wb.Sheets['社員マスタ'];if(ws1){const rows=XLSX.utils.sheet_to_json(ws1,{defval:''});console.log('Reading',rows.length,'rows');emps=rows.map(row=>{try{
  const emp={
    id:String(row['社員番号']||'').trim(),
    name:String(row['氏名']||'').trim(),
    belong:String(row['所属']||'').trim(),
    dept:String(row['部署']||'').trim(),
    position:String(row['役職']||'').trim(),
    jobType:String(row['職種']||'').trim(),
    grade:String(row['等級']||'').trim(),
    goubou:String(row['号棒']||'').trim(),
    email:String(row['メールアドレス']||'').trim(),
    phone:String(row['電話番号']||'').trim(),
    joined:fmtD(row['入社日']),
    dob:fmtD(row['生年月日']),
    zip:String(row['郵便番号']||'').trim(),
    address:String(row['住所']||'').trim(),
    nameChanged:fmtD(row['氏名変更日']),
    addressChanged:fmtD(row['住所変更日']),
    skills:String(row['スキル']||'').split(',').map(s=>s.trim()).filter(Boolean),
    notes:String(row['備考']||'').trim(),
    certs:parseCerts(row),
    gradeHistory:parseGradeHistory(row),
    transferHistory:parseTransferHistory(row),
    skillLevels:parseSLvs(row)
  };
  return emp;}catch(e){console.error('Row parse error:',e,row);return null;}}).filter(e=>e&&e.name);}const ws2=wb.Sheets['人事評価'];if(ws2){const rows=XLSX.utils.sheet_to_json(ws2,{defval:''});evals=rows.map(row=>({empId:String(row['社員番号']||'').trim(),period:String(row['評価期間']||'').trim(),satei:String(row['査定期間']||'').trim(),eval1st:String(row['1次評価者']||'').trim(),eval2nd:String(row['2次評価者']||'').trim(),comment:String(row['コメント']||'').trim(),compScores:parseCSc(row),kpiScores:parseKSc(row)})).filter(r=>r.empId);}renderAll();updBadge();['btn-add','btn-exp'].forEach(id=>document.getElementById(id).style.display='inline-flex');closeMo('load-mo');toast(`${file.name} 読み込み完了（${emps.length}名）${Object.keys(photoMap).length?' · 顔写真'+Object.keys(photoMap).length+'枚':''}`,'suc');if(sb())syncToSupabase();}catch(err){console.error('Excel load error:',err);alert('読み込みエラー: '+err.message+'\n\nF12を押してConsoleタブで詳細を確認してください。');toast('読み込みエラー: '+err.message,'err');const btn=document.getElementById('do-load-btn');btn.textContent='読み込む';btn.disabled=false;}};r.readAsBinaryString(file);}
function parseCerts(row){
  const c=[];
  // 資格名1から始まる列を全てチェック
  for(let i=1;i<=999;i++){
    const nm=row[`資格名${i}`];
    if(!nm||!String(nm).trim())break;  // 空欄が出たら終了
    c.push({name:String(nm).trim(),acquired:fmtD(row[`資格取得日${i}`]),expiry:fmtD(row[`資格有効期限${i}`])});
  }
  return c;
}
function parseGradeHistory(row){
  const h=[];
  for(let i=1;i<=999;i++){
    const date=row[`等級履歴${i}_日付`];
    if(!date||!String(date).trim())break;
    h.push({
      date:fmtD(date),
      grade:String(row[`等級履歴${i}_等級`]||'').trim(),
      goubou:String(row[`等級履歴${i}_号棒`]||'').trim(),
      reason:String(row[`等級履歴${i}_理由`]||'').trim()
    });
  }
  return h;
}
function parseTransferHistory(row){
  const h=[];
  for(let i=1;i<=999;i++){
    const date=row[`転籍履歴${i}_日付`];
    if(!date||!String(date).trim())break;
    h.push({
      date:fmtD(date),
      type:String(row[`転籍履歴${i}_種類`]||'').trim(),
      fromBelong:String(row[`転籍履歴${i}_異動前所属`]||'').trim(),
      fromDept:String(row[`転籍履歴${i}_異動前部署`]||'').trim(),
      toBelong:String(row[`転籍履歴${i}_異動後所属`]||'').trim(),
      toDept:String(row[`転籍履歴${i}_異動後部署`]||'').trim(),
      reason:String(row[`転籍履歴${i}_理由`]||'').trim()
    });
  }
  return h;
}

function parseSLvs(row){const sl={};skillItems.forEach(sk=>{const v=row[`スキル_${sk}`];if(v!==undefined&&v!=='')sl[sk]=parseInt(v)||0;});return sl;}
function parseCSc(row){const sc={};for(let i=0;i<20;i++){['comp_'+(i*2),'comp_'+(i*2+1)].forEach((k,j)=>{if(row[k]!==undefined&&row[k]!=='')sc[i*2+j]=parseFloat(row[k])||0;});} return sc;}
function parseKSc(row){const sc={};for(let i=0;i<20;i++){['kpi_'+(i*3),'kpi_'+(i*3+1),'kpi_'+(i*3+2)].forEach((k,j)=>{if(row[k]!==undefined&&row[k]!=='')sc[i*3+j]=parseFloat(row[k])||0;});}return sc;}

// ─── EXPORT ───
function exportExcel(){const wb=XLSX.utils.book_new();const h1=['社員番号','氏名','所属','部署','役職','職種','等級','号棒','メールアドレス','電話番号','入社日','生年月日','郵便番号','住所','氏名変更日','住所変更日','スキル','備考'];
// 最大資格数を計算
const maxCerts=Math.max(1,...emps.map(e=>(e.certs||[]).length));
const maxGradeHist=Math.max(1,...emps.map(e=>(e.gradeHistory||[]).length));
const maxTransferHist=Math.max(1,...emps.map(e=>(e.transferHistory||[]).length));
for(let i=1;i<=maxCerts;i++)h1.push(`資格名${i}`,`資格取得日${i}`,`資格有効期限${i}`);
for(let i=1;i<=maxGradeHist;i++)h1.push(`等級履歴${i}_日付`,`等級履歴${i}_等級`,`等級履歴${i}_号棒`,`等級履歴${i}_理由`);
for(let i=1;i<=maxTransferHist;i++)h1.push(`転籍履歴${i}_日付`,`転籍履歴${i}_種類`,`転籍履歴${i}_異動前所属`,`転籍履歴${i}_異動前部署`,`転籍履歴${i}_異動後所属`,`転籍履歴${i}_異動後部署`,`転籍履歴${i}_理由`);skillItems.forEach(sk=>h1.push(`スキル_${sk}`));const r1=emps.map(e=>{const r=[e.id,e.name,e.belong||'',e.dept,e.position,e.jobType,e.grade,e.goubou||'',e.email,e.phone,e.joined,e.dob,e.zip||'',e.address||'',e.nameChanged||'',e.addressChanged||'',(e.skills||[]).join(', '),e.notes];for(let i=0;i<maxCerts;i++){const c=(e.certs||[])[i]||{};r.push(c.name||'',c.acquired||'',c.expiry||'');}  // 資格
for(let i=0;i<maxGradeHist;i++){const g=(e.gradeHistory||[])[i]||{};r.push(g.date||'',g.grade||'',g.goubou||'',g.reason||'');}  // 等級履歴
for(let i=0;i<maxTransferHist;i++){const t=(e.transferHistory||[])[i]||{};r.push(t.date||'',t.type||'',t.fromBelong||'',t.fromDept||'',t.toBelong||'',t.toDept||'',t.reason||'');}  // 転籍履歴
skillItems.forEach(sk=>r.push((e.skillLevels||{})[sk]||0));return r;});XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h1,...r1]),'社員マスタ');const h2=['社員番号','評価期間','査定期間','1次評価者','2次評価者','コメント'];for(let i=0;i<compItems.length;i++)h2.push(`comp_${i*2}`,`comp_${i*2+1}`);for(let i=0;i<kpiItems.length;i++)h2.push(`kpi_${i*3}`,`kpi_${i*3+1}`,`kpi_${i*3+2}`);const r2=evals.map(v=>{const r=[v.empId,v.period,v.satei,v.eval1st,v.eval2nd,v.comment];for(let i=0;i<compItems.length;i++){r.push((v.compScores||{})[i*2]||'');r.push((v.compScores||{})[i*2+1]||'');}for(let i=0;i<kpiItems.length;i++){r.push((v.kpiScores||{})[i*3]||'');r.push((v.kpiScores||{})[i*3+1]||'');r.push((v.kpiScores||{})[i*3+2]||'');}return r;});XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h2,...r2]),'人事評価');XLSX.writeFile(wb,loadedFile||'社員データ.xlsx');toast('Excelを保存しました！OneDriveに上書きしてください','suc');}

// ─── RENDER ALL ───
function renderLaborCost(){
  console.log('=== renderLaborCost called ===');
  const empId=document.getElementById('cost-emp-filter')?.value||'';
  const targetEmps=empId?emps.filter(e=>e.id===empId):emps;
  const costItems={salary:{name:'基本給',monthly:true,calc:e=>200000+(parseInt(e.grade)||1-1)*50000},bonus:{name:'賞与',monthly:false,calc:e=>(200000+(parseInt(e.grade)||1-1)*50000)*4},insurance:{name:'社会保険',monthly:true,calc:e=>Math.round((200000+(parseInt(e.grade)||1-1)*50000)*0.15)},welfare:{name:'福利厚生',monthly:true,calc:e=>15000},uniform:{name:'被服費',monthly:false,calc:e=>30000},equipment:{name:'備品',monthly:false,calc:e=>150000},training:{name:'研修',monthly:false,calc:e=>50000},other:{name:'その他',monthly:true,calc:e=>5000}};
  const empCosts=targetEmps.map(e=>{let m=0,y=0,c={};Object.entries(costItems).forEach(([k,i])=>{const a=i.calc(e);c[k]=a;if(i.monthly){m+=a;y+=a*12}else{y+=a}});return{emp:e,costs:c,monthlyTotal:m,yearlyTotal:y}});
  const tm=empCosts.reduce((s,e)=>s+e.monthlyTotal,0);
  const ty=empCosts.reduce((s,e)=>s+e.yearlyTotal,0);
  const av=targetEmps.length?Math.round(ty/targetEmps.length):0;
  let h='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">';
  h+='<div class="sc"><div class="sc-top"><div class="sc-ico ib">💰</div></div><div class="sc-lbl">月次総額</div><div class="sc-val">'+tm.toLocaleString()+'</div><div class="sc-sub">円/月</div></div>';
  h+='<div class="sc"><div class="sc-top"><div class="sc-ico ig">📊</div></div><div class="sc-lbl">年間総額</div><div class="sc-val">'+ty.toLocaleString()+'</div><div class="sc-sub">円/年</div></div>';
  h+='<div class="sc"><div class="sc-top"><div class="sc-ico io">👤</div></div><div class="sc-lbl">1人平均</div><div class="sc-val">'+av.toLocaleString()+'</div><div class="sc-sub">円/年</div></div>';
  h+='<div class="sc"><div class="sc-top"><div class="sc-ico ip">➕</div></div><div class="sc-lbl">採用コスト</div><div class="sc-val">'+(av+500000).toLocaleString()+'</div><div class="sc-sub">円</div></div></div>';
  h+='<table class="ctbl"><thead><tr><th>社員</th><th>部署</th>';
  Object.values(costItems).forEach(i=>h+='<th>'+i.name+'</th>');
  h+='<th>月計</th><th>年計</th></tr></thead><tbody>';
  empCosts.forEach(ec=>{h+='<tr><td>'+ec.emp.name+'</td><td>'+ec.emp.dept+'</td>';Object.entries(costItems).forEach(([k])=>h+='<td style="text-align:right">'+ec.costs[k].toLocaleString()+'</td>');h+='<td style="text-align:right;font-weight:700">'+ec.monthlyTotal.toLocaleString()+'</td><td style="text-align:right;font-weight:700">'+ec.yearlyTotal.toLocaleString()+'</td></tr>'});
  h+='</tbody></table>';
  const b=document.getElementById('labor-cost-body');
  if(b){b.innerHTML=h;console.log('labor-cost-body updated, padding:',window.getComputedStyle(document.getElementById('page-labor-cost')).padding);}
  const f=document.getElementById('cost-emp-filter');
  if(f&&f.options.length===1)emps.forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=e.name+' ('+e.dept+')';f.appendChild(o)});
}



function renderAll(){updDL();renderDash();renderEmps();renderOrg();renderCerts();renderSkillMap();
  renderLaborCost();renderEvalList();renderAnalytics();renderPlacement();renderAttrition();}
function updDL(){const belongs=[...new Set(emps.map(e=>e.belong).filter(Boolean))].sort();const depts=[...new Set(emps.map(e=>e.dept).filter(Boolean))].sort();const poses=[...new Set(emps.map(e=>e.position).filter(Boolean))].sort();['cert-df','sm-df','eval-df','dept-f'].forEach(id=>{const el=document.getElementById(id);if(!el)return;const v=el.value;el.innerHTML='<option value="">全部署</option>'+depts.map(d=>`<option value="${d}">${d}</option>`).join('');el.value=v;});const pf=document.getElementById('pos-f');if(pf){const v=pf.value;pf.innerHTML='<option value="">全役職</option>'+poses.map(p=>`<option value="${p}">${p}</option>`).join('');pf.value=v;}document.getElementById('belong-dl').innerHTML=belongs.map(b=>`<option value="${b}">`).join('');document.getElementById('dept-dl').innerHTML=depts.map(d=>`<option value="${d}">`).join('');document.getElementById('pos-dl').innerHTML=poses.map(p=>`<option value="${p}">`).join('');document.getElementById('eval-emp-sel').innerHTML=emps.map(e=>`<option value="${e.id}">${e.name}（${e.dept}）</option>`).join('');}

// ─── DASHBOARD ───
function renderDash(){if(!emps.length)return;renderAlerts('main-alerts');const depts=[...new Set(emps.map(e=>e.dept))];const alerts=getAlerts();const rHi=emps.filter(e=>calcRisk(e)>60).length;const evSc=evals.map(v=>calcFS(v)).filter(s=>s>0);const avgSc=evSc.length?Math.round(evSc.reduce((a,b)=>a+b)/evSc.length):0;const dashBody=document.getElementById('dash-body');if(dashBody)dashBody.innerHTML=`<div class="stats-grid"><div class="sc"><div class="sc-top"><div class="sc-ico ib">👥</div></div><div class="sc-lbl">総社員数</div><div class="sc-val">${emps.length}</div><div class="sc-sub">名在籍</div></div><div class="sc"><div class="sc-top"><div class="sc-ico ig">🏢</div></div><div class="sc-lbl">部署数</div><div class="sc-val">${depts.length}</div><div class="sc-sub">部署</div></div><div class="sc"><div class="sc-top"><div class="sc-ico io">⚠️</div></div><div class="sc-lbl">資格アラート</div><div class="sc-val" style="color:${alerts.length?'var(--d)':'var(--g)'}">${alerts.length}</div><div class="sc-sub">件の要対応</div></div><div class="sc"><div class="sc-top"><div class="sc-ico ip">📊</div></div><div class="sc-lbl">評価平均</div><div class="sc-val">${avgSc||'—'}</div><div class="sc-sub">/ 100点</div></div><div class="sc"><div class="sc-top"><div class="sc-ico ir">🚨</div></div><div class="sc-lbl">離職リスク高</div><div class="sc-val" style="color:${rHi?'var(--d)':'var(--g)'}">${rHi}</div><div class="sc-sub">名 要注意</div></div><div class="sc"><div class="sc-top"><div class="sc-ico is">📝</div></div><div class="sc-lbl">評価件数</div><div class="sc-val">${evals.length}</div><div class="sc-sub">件</div></div></div><div class="sec-hd"><div class="sec-title">最近の社員</div><button class="btn btn-s btn-sm" onclick="nav('employees')">全員を見る →</button></div><div class="egrid">${[...emps].slice(-8).reverse().map(ecHTML).join('')}</div>`;}

// ─── EMPLOYEES ───
function ecHTML(e){
  const photo=getPhoto(e.id);
  const photoHTML=photo
    ?`<div class="emp-card-photo" style="background-image:url('${photo}')"></div>`
    :`<div class="emp-card-photo emp-card-photo-placeholder"><span>${e.name.charAt(0)}</span></div>`;
  
  const skillsHTML=e.skills && e.skills.length
    ?'<div class="emp-card-skills">'+e.skills.slice(0,3).map(s=>'<span class="skill-tag">'+s+'</span>').join('')+(e.skills.length>3?'<span class="skill-more">+'+String(e.skills.length-3)+'</span>':'')+'</div>'
    :'';
  
  return `
    <div class="emp-card-modern" onclick="showDetail('${e.id}')">
      ${photoHTML}
      <div class="emp-card-info">
        <div class="emp-card-name">${e.name}</div>
        <div class="emp-card-meta">
          ${e.belong?'<span class="emp-meta-tag">'+e.belong+'</span>':''}
          <span class="emp-meta-tag emp-dept">${e.dept||'—'}</span>
        </div>
        <div class="emp-card-position">${e.position||'—'}</div>
        ${skillsHTML}
      </div>
    </div>
  `;
}
function renderEmps(){
  const q=(document.getElementById('emp-q')?.value||'').toLowerCase();
  const df=document.getElementById('dept-f')?.value||'';
  const pf=document.getElementById('pos-f')?.value||'';
  const filtered=emps.filter(e=>{
    const mq=!q||e.name.toLowerCase().includes(q)||(e.dept||'').toLowerCase().includes(q)||(e.skills||[]).some(s=>s.toLowerCase().includes(q));
    return mq&&(!df||e.dept===df)&&(!pf||e.position===pf);
  });
  
  const byDept={};
  filtered.forEach(e=>{
    const dept=e.dept||'未所属';
    if(!byDept[dept])byDept[dept]=[];
    byDept[dept].push(e);
  });
  
  const deptOrder=['役員','総務部','施工管理営業部','施工部','メンテナンス部'];
  const depts=Object.keys(byDept).sort((a,b)=>{
    const ia=deptOrder.indexOf(a);
    const ib=deptOrder.indexOf(b);
    if(ia===-1&&ib===-1)return a.localeCompare(b);
    if(ia===-1)return 1;
    if(ib===-1)return -1;
    return ia-ib;
  });
  
  const posRank={'社長':1,'副社長':2,'専務':3,'常務':4,'取締役':5,'部長':10,'次長':11,'課長':12,'係長':13,'主任':14,'一般職':20,'':99};
  
  const empGrid=document.getElementById('emp-grid');
  if(empGrid){
    let html='';
    if(depts.length){
      depts.forEach((dept,idx)=>{
        const deptEmps=byDept[dept];
        deptEmps.sort((a,b)=>{
          const ra=posRank[a.position]||99;
          const rb=posRank[b.position]||99;
          if(ra!==rb)return ra-rb;
          return a.name.localeCompare(b.name);
        });
        
        const deptId='d'+idx;
        
        html+='<div class="dept-box">';
        html+='<div class="dept-head" onclick="toggleDept(\''+deptId+'\')">';
        html+='<span class="dept-arrow" id="'+deptId+'-arrow">▼</span>';
        html+='<span class="dept-title">'+dept+'</span>';
        html+='<span class="dept-badge">'+deptEmps.length+'名</span>';
        html+='</div>';
        html+='<div class="dept-scroll" id="'+deptId+'" style="display:flex">';
        html+=deptEmps.map(ecHTML).join('');
        html+='</div>';
        html+='</div>';
      });
    }else{
      html='<div class="empty"><div class="empty-ico">🔍</div><div class="empty-txt">該当なし</div></div>';
    }
    empGrid.innerHTML=html;
  }
}

function renderSkillMap(){const df=document.getElementById('sm-df')?.value||'';const filtered=emps.filter(e=>!df||e.dept===df);if(!filtered.length||!skillItems.length){document.getElementById('skillmap-body').innerHTML='<div class="empty"><div class="empty-ico">🗺️</div><div class="empty-txt">データなし</div></div>';return;}let h='<div class="sm-wrap"><table class="sm-tbl"><thead><tr><th class="emp-col">社員名</th>';skillItems.forEach(sk=>{h+=`<th>${sk}</th>`;});h+='</tr></thead><tbody>';filtered.forEach(e=>{h+=`<tr><td class="emp-cell" onclick="showDetail('${e.id}','skillmap')"><div style="display:flex;align-items:center;gap:8px">${avHTML(e,'ec-av')}<div><div style="font-weight:700;font-size:12.5px">${e.name}</div><div style="font-size:11px;color:var(--txm)">${e.dept}</div></div></div></td>`;skillItems.forEach(sk=>{const lv=(e.skillLevels||{})[sk]||0;h+=`<td><span class="lv-badge lv${lv}" onclick="toggleSL('${e.id}','${sk}',event)" title="Lv${lv} クリックで変更">${lv}</span></td>`;});h+='</tr>';});h+='</tbody></table></div>';document.getElementById('skillmap-body').innerHTML=h;}

function renderEvalList(){const df=document.getElementById('eval-df')?.value||'';const filtered=evals.filter(v=>{const e=emps.find(x=>x.id===v.empId);return!df||e?.dept===df;});if(!filtered.length){document.getElementById('eval-list').innerHTML='<div class="empty"><div class="empty-ico">📊</div><div class="empty-txt">評価データなし</div><div class="empty-sub">「評価を追加」から登録してください</div></div>';return;}document.getElementById('eval-list').innerHTML=filtered.map(v=>{const e=emps.find(x=>x.id===v.empId);const sc=calcFS(v);const rk=calcRank(sc);const idx=evals.indexOf(v);return`<div style="background:var(--sur);border:1.5px solid var(--bdr);border-radius:var(--r);padding:16px 20px;margin-bottom:11px;display:flex;align-items:center;gap:14px;box-shadow:var(--sh0);cursor:pointer;transition:all .18s" onmouseover="this.style.boxShadow='var(--sh)'" onmouseout="this.style.boxShadow='var(--sh0)'" onclick="openEvalMo(${idx})">${avHTML(e||{name:'?',id:''},'ec-av')}<div style="flex:1"><div style="font-weight:700;font-size:14px">${e?.name||'不明'} <span style="font-weight:400;color:var(--txm);font-size:12.5px">${e?'（'+e.dept+'）':''}</span></div><div style="font-size:12px;color:var(--txm);margin-top:2px">${v.period||'期間未設定'}</div></div><div style="text-align:center"><div style="font-family:'DM Sans',sans-serif;font-size:30px;font-weight:700;color:var(--p);line-height:1">${sc||'—'}</div><div style="font-size:11px;color:var(--txm)">/ 100点</div></div><div style="font-family:'DM Sans',sans-serif;font-size:26px;font-weight:700;background:var(--pl);color:var(--p);padding:7px 14px;border-radius:var(--rs)">${rk.rank}</div><button class="btn btn-d btn-xs" onclick="event.stopPropagation();delEval(${idx})">削除</button></div>`;}).join('');}

function showDetail(id,bp='employees'){const e=emps.find(x=>x.id===id);if(!e)return;document.getElementById('det-back-btn').onclick=()=>nav(bp);nav('detail');const evList=evals.filter(v=>v.empId===e.id);const al=getAlerts().filter(a=>a.e.id===e.id);const risk=calcRisk(e);const yr=tenureYears(e.joined);const lbgs=['var(--bg)','#dbeafe','#a5f3fc','#6ee7b7','#fbbf24','#ef4444'];const lcols=['var(--txl)','#1e40af','#155e75','#065f46','#78350f','#fff'];const lbls=['未習得','基礎知識','指示のもと実施可','独立実施可','指導可能','エキスパート'];const slH=skillItems.map(sk=>{const lv=(e.skillLevels||{})[sk]||0;return`<div style="display:flex;align-items:center;gap:12px;background:var(--sur);border:1px solid var(--bdr);border-radius:var(--rs);padding:10px 14px"><div style="min-width:110px;font-size:12.5px;font-weight:700">${sk}</div><div style="flex:1;height:14px;background:var(--bg);border-radius:4px;overflow:hidden"><div style="width:${lv*20}%;height:100%;background:${lbgs[lv]};transition:width .5s;border-radius:4px"></div></div><span style="font-size:11.5px;font-weight:700;min-width:120px;color:${lcols[lv]}">Lv${lv}：${lbls[lv]}</span></div>`;}).join('');const cR=(e.certs||[]).map(c=>{const st=certStatus(c.expiry);return`<tr><td style="font-weight:600">${c.name}</td><td>${c.acquired||'—'}</td><td>${c.expiry||'—'}</td><td>${st?st.badge:'<span class="sbdg sb-n">期限なし</span>'}</td></tr>`;}).join('');const evH=evList.length?evList.map(v=>{const sc=calcFS(v);const rk=calcRank(sc);return`<div style="background:var(--sur2);border:1px solid var(--bdr);border-radius:var(--rs);padding:12px 16px;margin-bottom:9px;display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="openEvalMo(${evals.indexOf(v)})"><div><div style="font-weight:700;font-size:14px">${v.period||'期間未設定'}</div>${v.comment?`<div style="font-size:12px;color:var(--txm);margin-top:3px">${v.comment.slice(0,60)}…</div>`:''}</div><div style="display:flex;align-items:center;gap:10px"><div style="text-align:center"><div style="font-family:'DM Sans',sans-serif;font-size:26px;font-weight:700;color:var(--p)">${sc||'—'}</div><div style="font-size:11px;color:var(--txm)">点</div></div><div style="font-family:'DM Sans',sans-serif;font-size:22px;font-weight:700;background:var(--pl);color:var(--p);padding:6px 14px;border-radius:var(--rs)">${rk.rank}</div></div></div>`;}).join(''):`<div class="empty"><div class="empty-ico">📋</div><div class="empty-txt">評価データなし</div></div>`;document.getElementById('detail-content').innerHTML=`<div style="border-radius:var(--r);overflow:hidden;margin-bottom:18px"><div class="det-hd">${avHTML(e,'det-av')}<div style="flex:1"><div class="det-nm">${e.name}</div><div class="det-dp">${e.dept}${e.position?' / '+e.position:''}</div><div style="display:flex;flex-wrap:wrap;gap:5px">${e.id?`<span class="det-bdg">${e.id}</span>`:''}${e.grade?`<span class="det-bdg">等級${e.grade}</span>`:''}<span class="det-bdg">在籍${yr}年</span></div></div><div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end"><div style="display:flex;gap:7px"><button class="btn btn-s btn-sm" onclick="openEmpMo('edit','${e.id}')">✏️ 編集</button><button class="btn btn-d btn-sm" onclick="delEmp('${e.id}')">🗑</button></div><div style="background:rgba(255,255,255,.16);color:#fff;padding:5px 12px;border-radius:var(--rs);font-size:12.5px;font-weight:600;border:1px solid rgba(255,255,255,.25)">離職リスク：<span style="font-weight:700;color:${risk>60?'#fca5a5':risk>30?'#fde68a':'#86efac'}">${risk}%</span></div>${al.length?`<div style="background:rgba(239,68,68,.8);color:#fff;padding:5px 12px;border-radius:var(--rs);font-size:11.5px;font-weight:700">⚠️ 資格アラート${al.length}件</div>`:''}</div></div><div class="det-body"><div class="tabs"><div class="tab active" onclick="swTab(this,'dt-basic')">基本情報</div><div class="tab" onclick="swTab(this,'dt-certs')">資格・免許（${(e.certs||[]).length}件）</div><div class="tab" onclick="swTab(this,'dt-skills')">スキル</div><div class="tab" onclick="swTab(this,'dt-eval')">人事評価（${evList.length}件）</div></div><div class="tc active" id="dt-basic"><div class="det-grid"><div class="df"><div class="dfl">メール</div><div class="dfv">${e.email||'—'}</div></div><div class="df"><div class="dfl">電話</div><div class="dfv">${e.phone||'—'}</div></div><div class="df"><div class="dfl">入社日</div><div class="dfv">${e.joined||'—'}</div></div><div class="df"><div class="dfl">生年月日</div><div class="dfv">${e.dob||'—'}</div></div>
        <div class="df"><div class="dfl">郵便番号</div><div class="dfv">${e.zip||'—'}</div></div>
        <div class="df" style="grid-column:1/-1"><div class="dfl">住所</div><div class="dfv">${e.address||'—'}</div></div>
        ${e.nameChanged?'<div class="df"><div class="dfl">氏名変更日</div><div class="dfv">'+e.nameChanged+'</div></div>':''}
        ${e.addressChanged?'<div class="df"><div class="dfl">住所変更日</div><div class="dfv">'+e.addressChanged+'</div></div>':''}<div class="df"><div class="dfl">職種</div><div class="dfv">${e.jobType||'—'}</div></div><div class="df"><div class="dfl">等級</div><div class="dfv">${e.grade||'—'}</div></div></div>${(e.skills||[]).length?`<div class="det-sec">スキル</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px">${e.skills.map(s=>`<span class="chip">${s}</span>`).join('')}</div>`:''}${e.notes?`<div class="det-sec">備考</div><div style="font-size:13px;color:var(--txm);line-height:1.8">${e.notes}</div>`:''}</div><div class="tc" id="dt-certs">${(e.certs||[]).length?`<table class="ctbl"><thead><tr><th>資格・免許名</th><th>取得日</th><th>有効期限</th><th>ステータス</th></tr></thead><tbody>${cR}</tbody></table>`:`<div class="empty"><div class="empty-ico">🎓</div><div class="empty-txt">資格データなし</div></div>`}</div><div class="tc" id="dt-skills">${skillItems.length?`<div style="display:flex;flex-direction:column;gap:8px">${slH}</div>`:`<div class="empty"><div class="empty-ico">🗺️</div><div class="empty-txt">スキルデータなし</div></div>`}</div><div class="tc" id="dt-eval">${evH}</div></div></div>`;}

function toggleDept(id){
  const el=document.getElementById(id);
  const arrow=document.getElementById(id+'-arrow');
  if(!el||!arrow)return;
  if(el.style.display==='none'){
    el.style.display='flex';
    arrow.textContent='▼';
  }else{
    el.style.display='none';
    arrow.textContent='▶';
  }
}



function swTab(el,tabId){
  const detBody=el.closest('.det-body');
  if(!detBody)return;
  detBody.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  detBody.querySelectorAll('.tc').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const targetTab=document.getElementById(tabId);
  if(targetTab)targetTab.classList.add('active');
}

function renderOrg(){
  console.log('=== renderOrg ver1.6 called ===');
  console.log('emps count:', emps.length);
  const depts={};
  emps.forEach(e=>{
    const dept=e.dept||'未所属';
    if(!depts[dept])depts[dept]=[];
    depts[dept].push(e);
  });
  const posRank={'社長':1,'副社長':2,'専務':3,'常務':4,'取締役':5,'部長':10,'次長':11,'課長':12,'係長':13,'主任':14,'一般職':20,'':99};
  const deptKeys=Object.keys(depts).sort();
  console.log('deptKeys:', deptKeys);
  console.log('depts:', depts);
  const orgWrap=document.getElementById('org-wrap');
  if(!orgWrap)return;
  if(!deptKeys.length){
    orgWrap.innerHTML='<div class="empty"><div class="empty-ico">🏢</div><div class="empty-txt">データなし</div></div>';
    return;
  }
  console.log('Generating 1-level org chart HTML');
  let html='<div class="org-tree"><div class="org-level-0"><div class="org-tree-node root-node"><div class="org-node-content"><div class="org-node-icon">🏢</div><div class="org-node-title">全社</div><div class="org-node-count">'+emps.length+'名</div></div></div><div class="org-tree-line-v"></div></div>';
  html+='<div class="org-level-1"><div class="org-tree-line-h"></div><div class="org-level-children">';
  deptKeys.forEach(dept=>{
    const members=depts[dept];
    members.sort((a,b)=>{const ra=posRank[a.position]||99;const rb=posRank[b.position]||99;if(ra!==rb)return ra-rb;return a.name.localeCompare(b.name);});
    const mgr=members.find(e=>e.position&&/部長|長|マネージャー|リーダー|社長|副社長/.test(e.position));
    html+='<div class="org-branch"><div class="org-tree-line-v-short"></div><div class="org-tree-node dept-node" onclick="document.getElementById(\'dept-f\').value=\''+dept+'\';nav(\'employees\');renderEmps()"><div class="org-node-content"><div class="org-node-icon">📁</div><div class="org-node-title">'+dept+'</div><div class="org-node-count">'+members.length+'名</div></div></div><div class="org-tree-line-v-short"></div><div class="org-members-box">';
    members.forEach(e=>{
      html+='<div class="org-member-name" onclick="event.stopPropagation();showDetail(\''+e.id+'\',\'org\')" style="cursor:pointer;text-decoration:underline">'+e.name+(e.position?' ('+e.position+')':'')+'</div>';
    });
    html+='</div></div>';
  });
  html+='</div></div></div>';
  orgWrap.innerHTML=html;
}


function toggleCert(id){
  const el=document.getElementById(id);
  const arrow=document.getElementById(id+'-arrow');
  if(!el||!arrow)return;
  if(el.style.display==='none'){
    el.style.display='flex';
    arrow.textContent='▼';
  }else{
    el.style.display='none';
    arrow.textContent='▶';
  }
}
function renderCerts(){
  const searchTerm=(document.getElementById('cert-search')?.value||'').toLowerCase();
  
  // 資格ごとにグループ化
  const certMap={};
  emps.forEach(e=>{
    (e.certs||[]).forEach(c=>{
      if(!certMap[c.name])certMap[c.name]={name:c.name,holders:[]};
      certMap[c.name].holders.push({emp:e,cert:c});
    });
  });
  
  const certNames=Object.keys(certMap).sort();
  let filtered=certNames;
  if(searchTerm){
    filtered=certNames.filter(cn=>cn.toLowerCase().includes(searchTerm));
  }
  
  const certBody=document.getElementById('cert-body');
  if(!certBody){console.error('cert-body not found');return;}
  
  if(!filtered.length){
    certBody.innerHTML='<div class="empty"><div class="empty-ico">🎓</div><div class="empty-txt">該当データなし</div></div>';
    return;
  }
  
  let html='';
  filtered.forEach(certName=>{
    const cert=certMap[certName];
    const id='cert-'+certName.replace(/[^a-zA-Z0-9]/g,'');
    
    // 人材情報と同じ dept-box スタイル
    html+=`<div class="dept-box">
      <div class="dept-header" onclick="toggleDept('${id}')">
        <span class="dept-arrow" id="${id}-arrow">▼</span>
        <div class="dept-name">${certName}</div>
        <div class="dept-count">${cert.holders.length}名</div>
      </div>
      <div class="dept-members" id="${id}">`;
    
    // 保有者を emp-card で表示（人材情報と完全に同じ）
    cert.holders.forEach(h=>{
      const st=certStatus(h.cert.expiry);
      html+=`<div class="emp-card" onclick="showDetail('${h.emp.id}','certs')">
        <div class="ec-av">${h.emp.name.charAt(0)}</div>
        <div class="ec-info">
          <div class="ec-name">${h.emp.name}</div>
          <div class="ec-pos">${h.emp.dept}</div>
          <div class="ec-dept">${h.emp.position||'—'}</div>
          <div style="font-size:11px;color:var(--txm);margin-top:6px">
            取得: ${h.cert.acquired||'—'}<br>期限: ${h.cert.expiry||'—'}
          </div>
          ${st?st.badge:'<span class="sbdg sb-n" style="margin-top:4px;display:inline-block">期限なし</span>'}
        </div>
      </div>`;
    });
    
    html+='</div></div>';
  });
  
  certBody.innerHTML=html;
}


function addTransferRow(t){
  t=t||{};
  const d=document.createElement('div');
  d.className='transfer-row';
  d.style.cssText='display:grid;grid-template-columns:110px 90px 120px 120px 120px 120px 1fr auto;gap:8px;align-items:end;margin-bottom:8px';
  d.innerHTML='<div class="fg"><label>異動日</label><input class="finp" type="date" value="'+(t.date||'')+'"></div>'
    +'<div class="fg"><label>種類</label><select class="finp"><option value="異動"'+(t.type==='異動'?' selected':'')+'>異動</option><option value="転籍"'+(t.type==='転籍'?' selected':'')+'>転籍</option><option value="出向"'+(t.type==='出向'?' selected':'')+'>出向</option><option value="復帰"'+(t.type==='復帰'?' selected':'')+'>復帰</option></select></div>'
    +'<div class="fg"><label>異動前所属</label><input class="finp" placeholder="本社" value="'+(t.fromBelong||'')+'"></div>'
    +'<div class="fg"><label>異動前部署</label><input class="finp" placeholder="営業部" value="'+(t.fromDept||'')+'"></div>'
    +'<div class="fg"><label>異動後所属</label><input class="finp" placeholder="東京支店" value="'+(t.toBelong||'')+'"></div>'
    +'<div class="fg"><label>異動後部署</label><input class="finp" placeholder="施工部" value="'+(t.toDept||'')+'"></div>'
    +'<div class="fg"><label>理由</label><input class="finp" placeholder="組織再編等" value="'+(t.reason||'')+'"></div>'
    +'<button class="btn btn-d btn-xs" style="align-self:flex-end;margin-bottom:2px" onclick="this.closest(\'.transfer-row\').remove()">✕</button>';
  document.getElementById('transfer-rows').appendChild(d);
}
function saveEmp(){const name=document.getElementById('f-name').value.trim();if(!name){toast('氏名は必須です','err');return;}const certs=[...document.querySelectorAll('#cert-rows .cert-row')].map(row=>{const inp=row.querySelectorAll('input');const nm=inp[0]?.value.trim();return nm?{name:nm,acquired:inp[1]?.value||'',expiry:inp[2]?.value||''}:null;}).filter(Boolean);
const gradeHistory=[...document.querySelectorAll('#grade-history-rows .grade-hist-row')].map(row=>{const inp=row.querySelectorAll('input,select');return inp[0]?.value?{date:inp[0]?.value||'',grade:inp[1]?.value||'',goubou:inp[2]?.value||'',reason:inp[3]?.value||''}:null;}).filter(Boolean);
const transferHistory=[...document.querySelectorAll('#transfer-rows .transfer-row')].map(row=>{const inp=row.querySelectorAll('input,select');return inp[0]?.value?{date:inp[0]?.value||'',type:inp[1]?.value||'',fromBelong:inp[2]?.value||'',fromDept:inp[3]?.value||'',toBelong:inp[4]?.value||'',toDept:inp[5]?.value||'',reason:inp[6]?.value||''}:null;}).filter(Boolean);const rec={id:document.getElementById('f-id').value.trim()||`EMP${Date.now().toString().slice(-4)}`,name,belong:document.getElementById('f-belong').value.trim(),dept:document.getElementById('f-dept').value.trim(),position:document.getElementById('f-pos').value.trim(),jobType:document.getElementById('f-job').value.trim(),grade:document.getElementById('f-grade').value.trim(),goubou:document.getElementById('f-goubou').value.trim(),email:document.getElementById('f-email').value.trim(),phone:document.getElementById('f-phone').value.trim(),joined:document.getElementById('f-joined').value,dob:document.getElementById('f-dob').value,zip:document.getElementById('f-zip').value.trim(),address:document.getElementById('f-address').value.trim(),nameChanged:document.getElementById('f-name-changed').value,addressChanged:document.getElementById('f-address-changed').value,skills:document.getElementById('f-skills').value.split(',').map(s=>s.trim()).filter(Boolean),notes:document.getElementById('f-notes').value.trim(),certs,gradeHistory,transferHistory,skillLevels:editEmpId?emps.find(e=>e.id===editEmpId)?.skillLevels||{}:{}};if(editEmpId){const idx=emps.findIndex(e=>e.id===editEmpId);if(idx>=0)emps[idx]=rec;}else emps.push(rec);saveEmpToSupabase(rec);closeMo('emp-mo');renderAll();updBadge();toast(`${rec.name} を${editEmpId?'更新':'追加'}しました`,'suc');}
function delEmp(id){const e=emps.find(x=>x.id===id);if(!confirm(`${e?.name||id} を削除しますか？`))return;emps=emps.filter(x=>x.id!==id);evals=evals.filter(v=>v.empId!==id);delEmpFromSupabase(id);nav('employees');renderAll();updBadge();toast('削除しました');}

// ─── RISK ───
function calcRisk(e){let sc=0;const yr=tenureYears(e.joined);if(yr>=1&&yr<=3)sc+=30;else if(yr===0)sc+=20;else if(yr>=4&&yr<=6)sc+=10;const ev=evals.filter(v=>v.empId===e.id).map(v=>calcFS(v)).filter(s=>s>0);if(ev.length>=2){const tr=ev[ev.length-1]-ev[ev.length-2];if(tr<-10)sc+=30;else if(tr<0)sc+=15;}else if(ev.length===1&&ev[0]<50)sc+=20;const expired=getAlerts().filter(a=>a.e.id===e.id&&a.type==='expired').length;sc+=expired*10;const avgSk=skillItems.length?skillItems.reduce((s,sk)=>s+((e.skillLevels||{})[sk]||0),0)/skillItems.length:3;if(avgSk<1.5)sc+=20;return Math.min(sc,99);}

// ─── ANALYTICS ───
function renderEvalSettings(){document.getElementById('eval-settings-body').innerHTML=`<div style="margin-bottom:24px"><div style="font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:10px">コンピテンシー項目（行動指標）<button class="btn btn-s btn-sm" onclick="addCompItem()">＋ 追加</button></div><div id="comp-list">${compItems.map((item,i)=>compIH(item,i)).join('')}</div></div><div><div style="font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:10px">KPI項目（数値目標）<button class="btn btn-s btn-sm" onclick="addKpiItem()">＋ 追加</button></div><div id="kpi-list">${kpiItems.map((item,i)=>kpiIH(item,i)).join('')}</div></div>`;}

function renderAnalytics(){if(!emps.length){const analyticsBody=document.getElementById('analytics-body');if(analyticsBody)analyticsBody.innerHTML='<div class="empty"><div class="empty-ico">📈</div><div class="empty-txt">データなし</div></div>';return;}const depts={};emps.forEach(e=>{depts[e.dept]=(depts[e.dept]||0)+1;});const maxD=Math.max(...Object.values(depts),1);const deptBars=Object.entries(depts).sort((a,b)=>b[1]-a[1]).map(([d,n])=>`<div class="bar-row"><div class="bar-lbl">${d}</div><div class="bar-bg"><div class="bar-fill" style="width:${n/maxD*100}%;background:var(--p)"></div></div><div class="bar-val">${n}名</div></div>`).join('');const rankDist={};evals.forEach(v=>{const rk=calcRank(calcFS(v)).rank;rankDist[rk]=(rankDist[rk]||0)+1;});const maxR=Math.max(...Object.values(rankDist),1);const rankBars=RANKS.map(({r})=>`<div class="bar-row"><div class="bar-lbl">${r}</div><div class="bar-bg"><div class="bar-fill" style="width:${(rankDist[r]||0)/maxR*100}%;background:${(rankDist[r]||0)>=2?'var(--g)':'var(--p)'}"></div></div><div class="bar-val">${rankDist[r]||0}件</div></div>`).join('');const skAvg=skillItems.map(sk=>{const v=emps.map(e=>(e.skillLevels||{})[sk]||0);return{sk,avg:v.reduce((a,b)=>a+b,0)/v.length};}).sort((a,b)=>b.avg-a.avg);const maxSk=Math.max(...skAvg.map(s=>s.avg),1);const skBars=skAvg.map(({sk,avg})=>`<div class="bar-row"><div class="bar-lbl">${sk}</div><div class="bar-bg"><div class="bar-fill" style="width:${avg/5*100}%;background:${avg>3?'var(--g)':avg>2?'var(--w)':'var(--d)'}"></div></div><div class="bar-val">${avg.toFixed(1)}</div></div>`).join('');const tG={'〜1年':0,'1〜3年':0,'3〜5年':0,'5〜10年':0,'10年以上':0};emps.forEach(e=>{const yr=tenureYears(e.joined);if(yr<1)tG['〜1年']++;else if(yr<3)tG['1〜3年']++;else if(yr<5)tG['3〜5年']++;else if(yr<10)tG['5〜10年']++;else tG['10年以上']++;});const maxT=Math.max(...Object.values(tG),1);const tBars=Object.entries(tG).map(([k,n])=>`<div class="bar-row"><div class="bar-lbl">${k}</div><div class="bar-bg"><div class="bar-fill" style="width:${n/maxT*100}%;background:var(--cy)"></div></div><div class="bar-val">${n}名</div></div>`).join('');const hp=evals.filter(v=>calcFS(v)>=60).map(v=>{const e=emps.find(x=>x.id===v.empId);return{e,v,sc:calcFS(v)};}).filter(x=>x.e).sort((a,b)=>b.sc-a.sc).slice(0,6);const hpH=hp.length?hp.map(({e,v,sc})=>{const rk=calcRank(sc);return`<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--bdr);cursor:pointer" onclick="showDetail('${e.id}','analytics')">${avHTML(e,'ec-av')}<div style="flex:1"><div style="font-weight:700;font-size:13px">${e.name}</div><div style="font-size:11.5px;color:var(--txm)">${e.dept}</div></div><div style="font-family:'DM Sans',sans-serif;font-size:20px;font-weight:700;color:var(--p)">${sc}</div><div style="font-family:'DM Sans',sans-serif;font-size:16px;font-weight:700;background:var(--pl);color:var(--p);padding:4px 10px;border-radius:6px">${rk.rank}</div></div>`;}).join(''):`<div style="padding:20px;text-align:center;color:var(--txl);font-size:13px">評価データがありません</div>`;const analyticsBody=document.getElementById('analytics-body');if(analyticsBody)analyticsBody.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px"><div class="chart-card"><div class="chart-title">部署別人員数</div>${deptBars}</div><div class="chart-card"><div class="chart-title">評価ランク分布</div>${rankBars}</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px"><div class="chart-card"><div class="chart-title">スキル平均レベル（全社）</div>${skBars||'<div style="color:var(--txl);font-size:13px">スキルデータなし</div>'}</div><div class="chart-card"><div class="chart-title">在籍年数分布</div>${tBars}</div></div><div class="chart-card"><div class="chart-title">🏆 ハイパフォーマー（評価スコア60点以上）</div>${hpH}</div>`;}

// ─── PLACEMENT ───
function renderPlacement(){const skill=(document.getElementById('place-skill')?.value||'').trim().toLowerCase();if(!emps.length){const placementBody=document.getElementById('placement-body');if(placementBody)placementBody.innerHTML='<div class="empty"><div class="empty-ico">🔄</div><div class="empty-txt">データなし</div></div>';return;}const scored=emps.map(e=>{let m=0;if(skill){const slv=Object.entries(e.skillLevels||{}).find(([k])=>k.toLowerCase().includes(skill));if(slv)m+=slv[1]*15;if((e.skills||[]).some(s=>s.toLowerCase().includes(skill)))m+=20;}else{const ev=evals.filter(v=>v.empId===e.id);if(ev.length)m+=calcFS(ev[ev.length-1]);}const avgLv=skillItems.length?skillItems.reduce((s,sk)=>s+((e.skillLevels||{})[sk]||0),0)/skillItems.length:0;m+=avgLv*5;return{e,m:Math.min(Math.round(m),100)};}).sort((a,b)=>b.m-a.m);const gridH=scored.map(({e,m})=>{const risk=calcRisk(e);return`<div class="pc" onclick="showDetail('${e.id}','placement')"><div class="pc-hd">${avHTML(e,'pc-av')}<div style="flex:1"><div style="font-weight:700;font-size:13.5px">${e.name}</div><div style="font-size:11.5px;color:var(--txm)">${e.dept} / ${e.position||'—'}</div></div><div style="font-family:'DM Sans',sans-serif;font-size:20px;font-weight:700;color:${m>=70?'var(--g)':m>=40?'var(--w)':'var(--d)'}">${m}%</div></div><div style="font-size:12px;color:var(--txm);margin-bottom:6px">${skill?`「${skill}」マッチ度`:'総合スコア'}</div><div class="match-row"><div style="font-size:11px;color:var(--txm);min-width:40px">適性</div><div class="match-bg"><div class="match-fill" style="width:${m}%"></div></div></div><div class="match-row"><div style="font-size:11px;color:var(--txm);min-width:40px">リスク</div><div class="match-bg"><div style="height:100%;border-radius:3px;background:${risk>60?'var(--d)':risk>30?'var(--w)':'var(--g)'};width:${risk}%;transition:width .6s"></div></div></div></div>`;}).join('');const placementBody=document.getElementById('placement-body');if(placementBody)placementBody.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px">${gridH}</div>`;}

// ─── ATTRITION ───
function renderAttrition(){if(!emps.length){const attritionBody=document.getElementById('attrition-body');if(attritionBody)attritionBody.innerHTML='<div class="empty"><div class="empty-ico">🚨</div><div class="empty-txt">データなし</div></div>';return;}const scored=emps.map(e=>({e,risk:calcRisk(e)})).sort((a,b)=>b.risk-a.risk);const hi=scored.filter(x=>x.risk>60).length,md=scored.filter(x=>x.risk>30&&x.risk<=60).length,lo=scored.filter(x=>x.risk<=30).length;const listH=scored.map(({e,risk})=>{const rc=risk>60?'var(--d)':risk>30?'var(--w)':'var(--g)';const rl=risk>60?'高リスク':risk>30?'中リスク':'低リスク';const ev=evals.filter(v=>v.empId===e.id);const scores=ev.map(v=>calcFS(v)).filter(s=>s>0);const tr=scores.length>=2?scores[scores.length-1]-scores[scores.length-2]:0;const yr=tenureYears(e.joined);return`<div class="at-card" onclick="showDetail('${e.id}','attrition')">${avHTML(e,'at-av')}<div style="flex:1"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><div style="font-weight:700;font-size:13.5px">${e.name}</div><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:${risk>60?'#fee2e2':risk>30?'#fef3c7':'#d1fae5'};color:${rc}">${rl}</span></div><div style="font-size:12px;color:var(--txm)">${e.dept} / 在籍${yr}年${scores.length?` / 最新評価${scores[scores.length-1]}点`:''}</div><div style="display:flex;align-items:center;gap:6px;margin-top:6px"><div style="font-size:11px;color:var(--txm);min-width:60px">離職リスク</div><div class="rb-bg" style="flex:1"><div class="rb-fill" style="width:${risk}%;background:${rc}"></div></div><div style="font-size:12px;font-weight:700;color:${rc};min-width:36px">${risk}%</div></div></div>${scores.length>=2?`<div style="text-align:center;font-size:11.5px;font-weight:700;color:${tr>=0?'var(--g)':'var(--d)'}">${tr>=0?'↑':'↓'}${Math.abs(tr)}pt</div>`:''}</div>`;}).join('');const attritionBody=document.getElementById('attrition-body');if(attritionBody)attritionBody.innerHTML=`<div class="stats-grid" style="margin-bottom:22px"><div class="sc"><div class="sc-top"><div class="sc-ico ir">🚨</div></div><div class="sc-lbl">高リスク</div><div class="sc-val" style="color:var(--d)">${hi}</div><div class="sc-sub">名 (>60%)</div></div><div class="sc"><div class="sc-top"><div class="sc-ico io">⚠️</div></div><div class="sc-lbl">中リスク</div><div class="sc-val" style="color:var(--w)">${md}</div><div class="sc-sub">名 (30〜60%)</div></div><div class="sc"><div class="sc-top"><div class="sc-ico ig">✅</div></div><div class="sc-lbl">低リスク</div><div class="sc-val" style="color:var(--g)">${lo}</div><div class="sc-sub">名 (<30%)</div></div></div><div class="sec-hd"><div class="sec-title">離職リスクランキング</div><div style="font-size:12px;color:var(--txm)">在籍年数・評価トレンド・スキルレベルから算出</div></div>${listH}`;}

// ─── AUTH STATE ───
let currentUser = null;
function currentRole(){return currentUser ? currentUser.role : 'viewer';}
function isAdmin(){return currentRole() === 'admin';}
function isEvaluator(){return currentRole() === 'admin' || currentRole() === 'evaluator';}

const AUTH_KEY = 'hr-users-v1';
const SESSION_KEY = 'hr-session-v1';
const LS_DATA_KEY = 'hr-data-v3';
let oneDriveUrl = '';

const DEFAULT_USERS = [
  {id:'admin',    name:'システム管理者', role:'admin',     dept:''},
  {id:'evaluator1', name:'評価者1',      role:'evaluator', dept:''},
  {id:'viewer1',  name:'閲覧者1',       role:'viewer',    dept:''},
];

function hashPw(str){
  var salt='HRnavi2025_', s=salt+str+salt;
  for(var i=0;i<3;i++){try{s=btoa(unescape(encodeURIComponent(s)));}catch(e){s=btoa(s);}}
  while(s.length<64) s=s+s;
  return s.slice(0,64).replace(/[+\/=]/g, function(c){return{'+':'a','/':'b','=':'c'}[c];});
}
function getUsers(){var r=localStorage.getItem(AUTH_KEY);if(!r)return null;try{return JSON.parse(r);}catch(e){return null;}}
function saveUsers(u){localStorage.setItem(AUTH_KEY, JSON.stringify(u));}
function initUsers(){
  var u=getUsers();
  if(!u){
    u=DEFAULT_USERS.map(function(x){
      var pw = x.id==='admin'?'admin123': x.id==='evaluator1'?'eval123':'view123';
      return Object.assign({},x,{pwHash:hashPw(pw)});
    });
    saveUsers(u);
  }
  return u;
}
function restoreSession(){
  var raw=localStorage.getItem(SESSION_KEY);
  if(!raw) return false;
  try{
    var s=JSON.parse(raw);
    if(Date.now()-s.at > 8*3600*1000){localStorage.removeItem(SESSION_KEY);return false;}
    var users=getUsers()||initUsers();
    var user=users.filter(function(u){return u.id===s.userId;})[0];
    if(!user) return false;
    currentUser=Object.assign({},user);
    return true;
  }catch(e){return false;}
}
function doLogin(){
  try{
    var uid=document.getElementById('li-id').value.trim();
  var pw=document.getElementById('li-pw').value;
  if(!uid||!pw){showLoginErr('IDとパスワードを入力してください');return;}
  var users=getUsers()||initUsers();
  var user=users.filter(function(u){return u.id===uid;})[0];
  if(!user){showLoginErr('ユーザーIDが見つかりません');return;}
  var h=hashPw(pw);
  if(h!==user.pwHash){showLoginErr('パスワードが正しくありません');return;}
  currentUser=Object.assign({},user);
  localStorage.setItem(SESSION_KEY, JSON.stringify({userId:user.id, at:Date.now()}));
  document.getElementById('login-overlay').classList.add('hidden');
  updateAuthUI();
  renderAll();
  toast(user.name+'（'+roleLabel(user.role)+'）でログインしました','suc');
  }catch(e){
    // Silent error
  }
}
function doLoginQuick(uid,pw){
  try{
    var idEl=document.getElementById('li-id');
    var pwEl=document.getElementById('li-pw');
    if(!idEl||!pwEl)return;
    idEl.value=uid;
    pwEl.value=pw;
    doLogin();
  }catch(e){
    // Silent error
  }
}
function logout(){
  currentUser=null;
  localStorage.removeItem(SESSION_KEY);
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('li-id').value='';
  document.getElementById('li-pw').value='';
  var err=document.getElementById('li-err');
  if(err){err.textContent='';err.classList.remove('show');}
}
function showLoginErr(msg){
  var el=document.getElementById('li-err');
  if(!el)return;
  el.textContent=msg;
  el.style.display='block';
  el.classList.add('show');
  setTimeout(function(){el.classList.remove('show');el.style.display='none';},3500);
}
function roleLabel(r){return{admin:'管理者',evaluator:'評価者',viewer:'閲覧者'}[r]||r;}
function roleBadgeClass(r){return{admin:'role-bdg-admin',evaluator:'role-bdg-evaluator',viewer:'role-bdg-viewer'}[r]||'role-bdg-viewer';}
function updateAuthUI(){
  var admin=isAdmin(), ev=isEvaluator();
  ['btn-add','btn-exp'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.display=admin?'inline-flex':'none';
  });
  var eab=document.getElementById('eval-add-btn');
  if(eab) eab.style.display=ev?'inline-flex':'none';
  var uc=document.getElementById('user-chip-area');
  if(uc&&currentUser){
    uc.innerHTML='<div class="user-chip"><div class="user-av">'+currentUser.name.charAt(0)+'</div>'
      +'<span class="user-name">'+currentUser.name+'</span>'
      +'<span class="user-role-bdg '+roleBadgeClass(currentUser.role)+'">'+roleLabel(currentUser.role)+'</span></div>';
  }
}
// ─── USER MANAGEMENT ───
function nav_userMgmt(){
  if(!isAdmin()){toast('ユーザー管理は管理者のみです','err');return;}
  renderUserMgmt();
  openMo('um-mo');
}
function renderUserMgmt(){
  var users=getUsers()||[];
  const umList=document.getElementById('um-list');if(umList)umList.innerHTML=users.map(function(u,i){
    return '<div class="um-card">'
      +'<div class="um-av">'+u.name.charAt(0)+'</div>'
      +'<div style="flex:1"><div style="font-weight:700;font-size:13.5px">'+u.name
      +' <span style="font-size:12px;font-weight:400;color:var(--txm)">ID: '+u.id+'</span></div>'
      +'<div style="font-size:12px;color:var(--txm)">'+(u.dept?'担当部署: '+u.dept:'全部署')+'</div></div>'
      +'<span class="user-role-bdg '+roleBadgeClass(u.role)+'" style="font-size:12px;padding:3px 10px">'+roleLabel(u.role)+'</span>'
      +(u.id!=='admin'
        ?'<button class="btn btn-s btn-xs" onclick="editUser('+i+')">編集</button>'
         +'<button class="btn btn-d btn-xs" onclick="delUser('+i+')">削除</button>'
        :'<span style="font-size:11px;color:var(--txl)">（保護）</span>')
      +'</div>';
  }).join('');
}
function openAddUser(){
  ['uf-id','uf-name','uf-pw','uf-dept'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('uf-role').value='viewer';
  document.getElementById('uf-edit-idx').value='';
  openMo('uf-mo');
}
function editUser(idx){
  var u=(getUsers()||[])[idx];
  if(!u)return;
  document.getElementById('uf-id').value=u.id;
  document.getElementById('uf-name').value=u.name;
  document.getElementById('uf-pw').value='';
  document.getElementById('uf-dept').value=u.dept||'';
  document.getElementById('uf-role').value=u.role;
  document.getElementById('uf-edit-idx').value=idx;
  openMo('uf-mo');
}
function saveUser(){
  var idx=document.getElementById('uf-edit-idx').value;
  var uid=document.getElementById('uf-id').value.trim();
  var name=document.getElementById('uf-name').value.trim();
  var pw=document.getElementById('uf-pw').value;
  var role=document.getElementById('uf-role').value;
  var dept=document.getElementById('uf-dept').value.trim();
  if(!uid||!name){toast('IDと名前は必須です','err');return;}
  var users=getUsers()||[];
  if(idx===''){
    if(users.filter(function(u){return u.id===uid;}).length){toast('このIDは既に使用されています','err');return;}
    if(!pw){toast('新規ユーザーはパスワードが必須です','err');return;}
    users.push({id:uid,name:name,role:role,dept:dept,pwHash:hashPw(pw)});
    toast(name+' を追加しました','suc');
  } else {
    var i=parseInt(idx);
    var h=pw?hashPw(pw):users[i].pwHash;
    users[i]=Object.assign({},users[i],{name:name,role:role,dept:dept,pwHash:h});
    toast(name+' を更新しました','suc');
  }
  saveUsers(users);
  closeMo('uf-mo');
  renderUserMgmt();
}
function delUser(idx){
  var users=getUsers()||[];
  var u=users[idx];
  if(!u||u.id==='admin'){toast('このユーザーは削除できません','err');return;}
  if(!confirm(u.name+' を削除しますか？'))return;
  users.splice(idx,1);
  saveUsers(users);
  renderUserMgmt();
  toast('削除しました');
}
function changePw(){openMo('cpw-mo');['cpw-old','cpw-new','cpw-confirm'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});}
function saveChangePw(){
  var old=document.getElementById('cpw-old').value;
  var nw=document.getElementById('cpw-new').value;
  var cf=document.getElementById('cpw-confirm').value;
  if(!old||!nw){toast('全て入力してください','err');return;}
  if(nw!==cf){toast('新しいパスワードが一致しません','err');return;}
  if(nw.length<4){toast('4文字以上にしてください','err');return;}
  var users=getUsers()||[];
  var idx=-1;
  for(var i=0;i<users.length;i++){if(users[i].id===currentUser.id){idx=i;break;}}
  if(idx<0)return;
  if(hashPw(old)!==users[idx].pwHash){toast('現在のパスワードが違います','err');return;}
  users[idx].pwHash=hashPw(nw);
  saveUsers(users);
  closeMo('cpw-mo');
  toast('パスワードを変更しました','suc');
}
function resumeData(){
  var raw=localStorage.getItem(LS_DATA_KEY);
  if(!raw){toast('保存データが見つかりません','err');return;}
  try{
    var d=JSON.parse(raw);
    emps=d.emps||[];evals=d.evals||[];photoMap=d.photoMap||{};
    loadedFile=d.loadedFile||'社員データ.xlsx';
    updateAuthUI();renderAll();updBadge();
    toast('データを復元しました（'+emps.length+'名）');
  }catch(e){toast('復元に失敗しました','err');}
}
// ─── STARTUP ───
async function startup(){
  try{
    initUsers();
    var restored=restoreSession();
    if(restored){
      document.getElementById('login-overlay').classList.add('hidden');
      var fromSupabase=await loadFromSupabase();
      if(fromSupabase&&emps.length){
        updateAuthUI();renderAll();updBadge();
        toast('Supabaseからデータを読み込みました（'+emps.length+'名）');
      }else{
        var raw=localStorage.getItem(LS_DATA_KEY);
        if(raw){
          try{
            var d=JSON.parse(raw);
            emps=d.emps||[];evals=d.evals||[];photoMap=d.photoMap||{};
            loadedFile=d.loadedFile||'社員データ.xlsx';
          }catch(e){}
        }
        updateAuthUI();renderAll();updBadge();
        if(emps.length) toast('前回のデータを復元しました（'+emps.length+'名）');
      }
    }
  }catch(e){
    document.getElementById('login-overlay').classList.remove('hidden');
  }
}
startup();