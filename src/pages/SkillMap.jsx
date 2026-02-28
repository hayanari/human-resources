import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getSkillItems } from '../lib/skillItems';

const LV_LABELS = [
  '未習得',
  '基礎知識',
  '指示のもと実施可',
  '独立実施可',
  '他者指導可',
  '熟練',
];

function LevelBadge({ emp, skillName, level, onCycle }) {
  const lv = Math.min(5, Math.max(0, level ?? 0));
  return (
    <span
      className={`lv-badge lv${lv}`}
      onClick={(e) => {
        e.stopPropagation();
        onCycle(emp, skillName, lv);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCycle(emp, skillName, lv);
        }
      }}
      role="button"
      tabIndex={0}
      title={`Lv${lv} ${LV_LABELS[lv]} - クリックで変更`}
    >
      {lv}
    </span>
  );
}

export default function SkillMap({ onOpenSkillSettings, skillItemsVersion = 0 }) {
  const { emps, photoMap, updateEmployee } = useApp();
  const [deptFilter, setDeptFilter] = useState('');
  const skillItems = useMemo(() => getSkillItems(), [skillItemsVersion]);

  const depts = useMemo(
    () => [...new Set(emps.map((e) => e.dept).filter(Boolean))].sort(),
    [emps]
  );

  const filtered = useMemo(
    () => (deptFilter ? emps.filter((e) => e.dept === deptFilter) : emps),
    [emps, deptFilter]
  );

  const cycleLevel = (emp, skillName, current) => {
    const next = (current + 1) % 6;
    const nextLevels = { ...(emp.skillLevels || {}), [skillName]: next };
    updateEmployee(emp.id, { skillLevels: nextLevels });
  };

  if (!skillItems.length) {
    return (
      <div className="empty">
        <div className="empty-ico">🗺️</div>
        <div className="empty-txt">スキル項目がありません</div>
        <div className="empty-sub">「スキル項目」ボタンから項目を追加してください</div>
        <button className="btn btn-p" style={{ marginTop: 16 }} onClick={onOpenSkillSettings}>
          ⚙️ スキル項目
        </button>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="empty">
        <div className="empty-ico">🗺️</div>
        <div className="empty-txt">データなし</div>
        <div className="empty-sub">社員データを読み込んでください</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sec-hd">
        <div className="sec-title">スキルマップ・習熟度管理</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="fsel"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">全部署</option>
            {depts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button className="btn btn-s btn-sm" onClick={onOpenSkillSettings}>
            ⚙️ スキル項目
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 7,
          flexWrap: 'wrap',
          marginBottom: 14,
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {LV_LABELS.map((lbl, i) => (
          <span
            key={i}
            className={`lv-badge lv${i}`}
            style={{ padding: '4px 10px', borderRadius: 999, border: '1px solid transparent' }}
          >
            Lv{i} {lbl}
          </span>
        ))}
      </div>

      <div className="sm-wrap">
        <table className="sm-tbl">
          <thead>
            <tr>
              <th className="emp-col">社員名</th>
              {skillItems.map((sk) => (
                <th key={sk}>{sk}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td className="emp-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {photoMap[emp.id] ? (
                      <div
                        className="ec-av"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundImage: `url('${photoMap[emp.id]}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ) : (
                      <div className="ec-av" style={{ width: 36, height: 36, fontSize: 14 }}>
                        {emp.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12.5 }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--txm)' }}>{emp.dept}</div>
                    </div>
                  </div>
                </td>
                {skillItems.map((sk) => (
                  <td key={sk}>
                    <LevelBadge
                      emp={emp}
                      skillName={sk}
                      level={(emp.skillLevels || {})[sk]}
                      onCycle={cycleLevel}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
