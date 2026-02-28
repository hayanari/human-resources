import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

function certStatus(expiry) {
  if (!expiry) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiry);
  exp.setHours(0, 0, 0, 0);
  const diff = Math.floor((exp - today) / 86400000);
  if (diff < 0) return { type: 'expired', badge: '期限切れ', cls: 'sb-x' };
  if (diff <= 30) return { type: 'expiring', badge: `${diff}日後`, cls: 'sb-e' };
  return { type: 'valid', badge: '有効', cls: 'sb-v' };
}

export default function Certs() {
  const { emps } = useApp();
  const [search, setSearch] = useState('');

  const certMap = useMemo(() => {
    const map = {};
    emps.forEach((e) => {
      (e.certs || []).forEach((c) => {
        if (!c.name?.trim()) return;
        if (!map[c.name]) map[c.name] = { name: c.name, holders: [] };
        map[c.name].holders.push({ emp: e, cert: c });
      });
    });
    return map;
  }, [emps]);

  const certNames = useMemo(() => {
    const names = Object.keys(certMap).sort();
    if (!search.trim()) return names;
    const q = search.toLowerCase();
    return names.filter((cn) => cn.toLowerCase().includes(q));
  }, [certMap, search]);

  if (!emps.length) {
    return (
      <div className="empty">
        <div className="empty-ico">🎓</div>
        <div className="empty-txt">データなし</div>
        <div className="empty-sub">社員データを読み込んでください</div>
      </div>
    );
  }

  if (!certNames.length) {
    return (
      <div>
        <div className="srch" style={{ marginBottom: 16 }}>
          <div className="srch-inp">
            <span style={{ color: 'var(--txl)' }}>🔍</span>
            <input
              type="text"
              placeholder="資格名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="empty">
          <div className="empty-ico">🎓</div>
          <div className="empty-txt">該当データなし</div>
          <div className="empty-sub">Excel の資格列を入力してください</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="srch" style={{ marginBottom: 16 }}>
        <div className="srch-inp">
          <span style={{ color: 'var(--txl)' }}>🔍</span>
          <input
            type="text"
            placeholder="資格名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="egrid" id="cert-body">
        {certNames.map((certName) => {
          const cert = certMap[certName];
          return (
            <div key={certName} className="dept-box">
              <div className="dept-head">
                <span className="dept-arrow">▼</span>
                <span className="dept-title">{certName}</span>
                <span className="dept-badge">{cert.holders.length}名</span>
              </div>
              <div className="dept-members">
                {cert.holders.map(({ emp, cert: c }) => {
                  const st = certStatus(c.expiry);
                  return (
                    <div key={emp.id} className="emp-card">
                      <div className="ec-av">{emp.name?.charAt(0) || '?'}</div>
                      <div className="ec-info">
                        <div className="ec-name">{emp.name}</div>
                        <div className="ec-pos">{emp.dept}</div>
                        <div className="ec-dept">{emp.position || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--txm)', marginTop: 6 }}>
                          取得: {c.acquired || '—'}<br />
                          期限: {c.expiry || '—'}
                        </div>
                        {st ? (
                          <span className={`sbdg ${st.cls}`} style={{ marginTop: 4, display: 'inline-block' }}>
                            <span className="sdot" style={{ background: st.type === 'expired' ? 'var(--d)' : st.type === 'expiring' ? 'var(--w)' : 'var(--g)' }} />
                            {st.badge}
                          </span>
                        ) : (
                          <span className="sbdg sb-n" style={{ marginTop: 4, display: 'inline-block' }}>
                            期限なし
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
