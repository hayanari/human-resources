import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

function EmpCard({ emp, photoMap }) {
  const photo = photoMap[emp.id];
  const photoHTML = photo ? (
    <div className="emp-card-photo" style={{ backgroundImage: `url('${photo}')` }} />
  ) : (
    <div className="emp-card-photo emp-card-photo-placeholder">
      <span>{emp.name?.charAt(0) || '?'}</span>
    </div>
  );

  const skillsHTML =
    emp.skills?.length > 0 ? (
      <div className="emp-card-skills">
        {emp.skills.slice(0, 3).map((s) => (
          <span key={s} className="skill-tag">
            {s}
          </span>
        ))}
        {emp.skills.length > 3 && (
          <span className="skill-more">+{emp.skills.length - 3}</span>
        )}
      </div>
    ) : null;

  return (
    <div className="emp-card-modern">
      {photoHTML}
      <div className="emp-card-info">
        <div className="emp-card-name">{emp.name}</div>
        <div className="emp-card-meta">
          {emp.belong && <span className="emp-meta-tag">{emp.belong}</span>}
          <span className="emp-meta-tag emp-dept">{emp.dept || '—'}</span>
        </div>
        <div className="emp-card-position">{emp.position || '—'}</div>
        {skillsHTML}
      </div>
    </div>
  );
}

export default function Employees({ content, onOpenAddEmp }) {
  const { emps, photoMap } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [posFilter, setPosFilter] = useState('');

  const depts = useMemo(() => [...new Set(emps.map((e) => e.dept).filter(Boolean))].sort(), [emps]);
  const positions = useMemo(() => [...new Set(emps.map((e) => e.position).filter(Boolean))].sort(), [emps]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return emps.filter((e) => {
      const mq =
        !q ||
        (e.name || '').toLowerCase().includes(q) ||
        (e.dept || '').toLowerCase().includes(q) ||
        (e.skills || []).some((s) => s.toLowerCase().includes(q));
      return mq && (!deptFilter || e.dept === deptFilter) && (!posFilter || e.position === posFilter);
    });
  }, [emps, search, deptFilter, posFilter]);

  const byDept = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      const dept = e.dept || '未所属';
      if (!map[dept]) map[dept] = [];
      map[dept].push(e);
    });
    const deptOrder = ['役員', '総務部', '施工管理営業部', '施工部', 'メンテナンス部'];
    return Object.keys(map).sort((a, b) => {
      const ia = deptOrder.indexOf(a);
      const ib = deptOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }).map((d) => ({ dept: d, emps: map[d] }));
  }, [filtered]);

  return (
    <div className="page active">
      <div className="srch">
        <div className="srch-inp">
          <span style={{ color: 'var(--txl)' }}>🔍</span>
          <input
            type="text"
            placeholder="名前・部署・スキルで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="fsel" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="">全部署</option>
          {depts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select className="fsel" value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
          <option value="">全役職</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button className="btn btn-p" onClick={() => onOpenAddEmp?.()}>
          ＋ 社員追加
        </button>
      </div>
      <div className="egrid" id="emp-grid">
        {byDept.length > 0 ? (
          byDept.map(({ dept, emps: deptEmps }) => (
            <div key={dept} className="dept-box">
              <div className="dept-head">
                <span className="dept-arrow">▼</span>
                <span className="dept-title">{dept}</span>
                <span className="dept-badge">{deptEmps.length}名</span>
              </div>
              <div className="dept-scroll">
                {deptEmps.map((emp) => (
                  <EmpCard key={emp.id} emp={emp} photoMap={photoMap} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <div className="empty-ico">🔍</div>
            <div className="empty-txt">該当なし</div>
          </div>
        )}
      </div>
    </div>
  );
}
