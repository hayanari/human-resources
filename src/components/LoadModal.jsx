import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

function fmtD(v) {
  if (!v) return '';
  if (v instanceof Date) {
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  }
  if (typeof v === 'number') {
    const d = new Date(Math.round((v - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  return String(v).trim().replace(/\//g, '-');
}

function parseCerts(row) {
  const c = [];
  for (let i = 1; i <= 999; i++) {
    const nm = row[`資格名${i}`];
    if (!nm || !String(nm).trim()) break;
    c.push({
      name: String(nm).trim(),
      acquired: fmtD(row[`資格取得日${i}`]),
      expiry: fmtD(row[`資格有効期限${i}`]),
    });
  }
  return c;
}

function parseGradeHistory(row) {
  const h = [];
  for (let i = 1; i <= 999; i++) {
    const date = row[`等級履歴${i}_日付`];
    if (!date || !String(date).trim()) break;
    h.push({
      date: fmtD(date),
      grade: String(row[`等級履歴${i}_等級`] || '').trim(),
      goubou: String(row[`等級履歴${i}_号棒`] || '').trim(),
      reason: String(row[`等級履歴${i}_理由`] || '').trim(),
    });
  }
  return h;
}

function parseTransferHistory(row) {
  const h = [];
  for (let i = 1; i <= 999; i++) {
    const date = row[`転籍履歴${i}_日付`];
    if (!date || !String(date).trim()) break;
    h.push({
      date: fmtD(date),
      type: String(row[`転籍履歴${i}_種類`] || '').trim(),
      fromBelong: String(row[`転籍履歴${i}_異動前所属`] || '').trim(),
      fromDept: String(row[`転籍履歴${i}_異動前部署`] || '').trim(),
      toBelong: String(row[`転籍履歴${i}_異動後所属`] || '').trim(),
      toDept: String(row[`転籍履歴${i}_異動後部署`] || '').trim(),
      reason: String(row[`転籍履歴${i}_理由`] || '').trim(),
    });
  }
  return h;
}

const DEFAULT_SKILLS = ['施工管理', '測量', 'AutoCAD'];
let skillItems = JSON.parse(localStorage.getItem('hr-skills') || 'null') || [...DEFAULT_SKILLS];

function parseSLvs(row) {
  const sl = {};
  skillItems.forEach((sk) => {
    const v = row[`スキル_${sk}`];
    if (v !== undefined && v !== '') sl[sk] = parseInt(v) || 0;
  });
  return sl;
}

export default function LoadModal({ onClose, onLoaded }) {
  const { setEmps, setEvals, setPhotoMap } = useApp();
  const [pendingExcel, setPendingExcel] = useState(null);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const excelRef = useRef(null);
  const photoRef = useRef(null);

  const exStatus = pendingExcel ? `✅ Excel：${pendingExcel.name}` : '⬜ Excel：未選択';
  const phStatus = pendingPhotos.length ? `✅ 顔写真：${pendingPhotos.length}枚` : '⬜ 顔写真：未選択（省略可）';
  const canLoad = !!pendingExcel;

  const onExcelChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setPendingExcel(f);
    e.target.value = '';
  };

  const onPhotosChange = (e) => {
    const fs = Array.from(e.target.files || []);
    if (fs.length) setPendingPhotos(fs);
    e.target.value = '';
  };

  const doLoad = () => {
    if (!pendingExcel) return;
    setLoading(true);

    const loadExcel = async (file) => {
      const XLSX = window.XLSX;
      if (!XLSX) {
        setLoading(false);
        alert('XLSX ライブラリが読み込まれていません');
        return;
      }
      const r = new FileReader();
      r.onload = async (ev) => {
        try {
          const wb = XLSX.read(ev.target.result, { type: 'binary', cellDates: true });
          const ws1 = wb.Sheets['社員マスタ'];
          let newEmps = [];
          if (ws1) {
            const rows = XLSX.utils.sheet_to_json(ws1, { defval: '' });
            newEmps = rows
              .map((row) => {
                try {
                  return {
                    id: String(row['社員番号'] || '').trim(),
                    name: String(row['氏名'] || '').trim(),
                    belong: String(row['所属'] || '').trim(),
                    dept: String(row['部署'] || '').trim(),
                    position: String(row['役職'] || '').trim(),
                    jobType: String(row['職種'] || '').trim(),
                    grade: String(row['等級'] || '').trim(),
                    goubou: String(row['号棒'] || '').trim(),
                    email: String(row['メールアドレス'] || '').trim(),
                    phone: String(row['電話番号'] || '').trim(),
                    joined: fmtD(row['入社日']),
                    dob: fmtD(row['生年月日']),
                    zip: String(row['郵便番号'] || '').trim(),
                    address: String(row['住所'] || '').trim(),
                    nameChanged: fmtD(row['氏名変更日']),
                    addressChanged: fmtD(row['住所変更日']),
                    skills: String(row['スキル'] || '')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                    notes: String(row['備考'] || '').trim(),
                    certs: parseCerts(row),
                    gradeHistory: parseGradeHistory(row),
                    transferHistory: parseTransferHistory(row),
                    skillLevels: parseSLvs(row),
                  };
                } catch (e) {
                  return null;
                }
              })
              .filter((e) => e && e.name);
          }

          let newEvals = [];
          const ws2 = wb.Sheets['人事評価'];
          if (ws2) {
            const rows = XLSX.utils.sheet_to_json(ws2, { defval: '' });
            newEvals = rows
              .map((row) => ({
                empId: String(row['社員番号'] || '').trim(),
                period: String(row['評価期間'] || '').trim(),
                satei: String(row['査定期間'] || '').trim(),
                eval1st: String(row['1次評価者'] || '').trim(),
                eval2nd: String(row['2次評価者'] || '').trim(),
                comment: String(row['コメント'] || '').trim(),
                compScores: {},
                kpiScores: {},
              }))
              .filter((r) => r.empId);
          }

          setEmps(newEmps);
          setEvals(newEvals);
          if (window.supabaseClient) {
            try {
              const empToRow = (e) => ({
                id: e.id, name: e.name, belong: e.belong || null, dept: e.dept || null,
                position: e.position || null, job_type: e.jobType || null, grade: e.grade || null,
                goubou: e.goubou || null, email: e.email || null, phone: e.phone || null,
                joined: e.joined || null, dob: e.dob || null, zip: e.zip || null, address: e.address || null,
                name_changed: e.nameChanged || null, address_changed: e.addressChanged || null,
                skills: e.skills || [], notes: e.notes || null, certs: e.certs || [],
                grade_history: e.gradeHistory || [], transfer_history: e.transferHistory || [],
                skill_levels: e.skillLevels || {},
              });
              const { data: existEmps } = await window.supabaseClient.from('employees').select('id');
              if (existEmps?.length) {
                await window.supabaseClient.from('employees').delete().in('id', existEmps.map((r) => r.id));
              }
              for (const e of newEmps) {
                await window.supabaseClient.from('employees').insert(empToRow(e));
              }
            } catch (err) {
              console.warn('Supabase sync error:', err);
            }
          }
          setLoading(false);
          onLoaded();
        } catch (err) {
          console.error('Excel load error:', err);
          setLoading(false);
          alert('読み込みエラー: ' + err.message);
        }
      };
      r.readAsBinaryString(file);
    };

    if (pendingPhotos.length) {
      const pm = {};
      let done = 0;
      pendingPhotos.forEach((f) => {
        const id = f.name.replace(/\.[^.]+$/, '').trim();
        const reader = new FileReader();
        reader.onload = (e) => {
          pm[id] = e.target.result;
          done++;
          if (done === pendingPhotos.length) {
            setPhotoMap(pm);
            loadExcel(pendingExcel);
          }
        };
        reader.readAsDataURL(f);
      });
    } else {
      setPhotoMap({});
      loadExcel(pendingExcel);
    }
  };

  return (
    <div className="mo open">
      <div className="mo-box" style={{ maxWidth: '500px' }}>
        <div className="mo-hd">
          <div className="mo-title">📂 データを読み込む</div>
          <button className="mo-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="mo-body">
          <p style={{ fontSize: '13px', color: 'var(--txm)', marginBottom: '18px', lineHeight: 1.8 }}>
            Excelファイルと顔写真をまとめて読み込めます。
          </p>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}>📊 Excelファイル（必須）</div>
            <div
              className={`ld-drop ${pendingExcel ? 'loaded' : ''}`}
              onClick={() => excelRef.current?.click()}
            >
              <div>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {pendingExcel ? '✅' : '📋'}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: pendingExcel ? 'var(--g)' : 'var(--p)',
                    fontSize: '13px',
                  }}
                >
                  {pendingExcel ? pendingExcel.name : '社員データ.xlsx を選択'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--txm)', marginTop: '3px' }}>.xlsx / .xls</div>
              </div>
            </div>
            <input
              ref={excelRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={onExcelChange}
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}>🖼 顔写真（任意）</div>
            <div
              className={`ld-drop ${pendingPhotos.length ? 'loaded' : ''}`}
              onClick={() => photoRef.current?.click()}
            >
              <div>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {pendingPhotos.length ? '✅' : '🗂'}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: pendingPhotos.length ? 'var(--g)' : 'var(--p)',
                    fontSize: '13px',
                  }}
                >
                  {pendingPhotos.length ? `${pendingPhotos.length}枚` : '顔写真を複数選択'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--txm)', marginTop: '3px' }}>
                  EMP001.jpg のように命名
                </div>
              </div>
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onPhotosChange}
              style={{ display: 'none' }}
            />
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--txl)', marginTop: '9px', lineHeight: 1.7 }}>
            💡 Ctrl+A で全選択→「開く」で一括読み込み可能
          </div>
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--bdr)', paddingTop: '12px' }}>
            <div style={{ fontSize: '12.5px', marginBottom: '5px' }}>{exStatus}</div>
            <div style={{ fontSize: '12.5px' }}>{phStatus}</div>
          </div>
        </div>
        <div className="mo-ft">
          <button className="btn btn-s" onClick={onClose}>
            閉じる
          </button>
          <button
            className="btn btn-p"
            onClick={doLoad}
            disabled={!canLoad || loading}
            style={{ opacity: canLoad && !loading ? 1 : 0.5 }}
          >
            {loading ? '読み込み中...' : '読み込む'}
          </button>
        </div>
      </div>
    </div>
  );
}
