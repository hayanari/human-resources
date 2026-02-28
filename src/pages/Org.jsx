import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

const POS_RANK = {
  社長: 1, 副社長: 2, 専務: 3, 常務: 4, 取締役: 5,
  部長: 10, 次長: 11, 課長: 12, 係長: 13, 主任: 14,
  一般職: 20, '': 99,
};

export default function Org({ onDeptClick }) {
  const { emps } = useApp();

  const byDept = useMemo(() => {
    const map = {};
    emps.forEach((e) => {
      const dept = e.dept || '未所属';
      if (!map[dept]) map[dept] = [];
      map[dept].push(e);
    });
    const deptKeys = Object.keys(map).sort();
    deptKeys.forEach((d) => {
      map[d].sort((a, b) => {
        const ra = POS_RANK[a.position] ?? 99;
        const rb = POS_RANK[b.position] ?? 99;
        if (ra !== rb) return ra - rb;
        return (a.name || '').localeCompare(b.name || '');
      });
    });
    return { keys: deptKeys, map };
  }, [emps]);

  if (!emps.length) {
    return (
      <div className="empty">
        <div className="empty-ico">🏢</div>
        <div className="empty-txt">データなし</div>
        <div className="empty-sub">社員データを読み込んでください</div>
      </div>
    );
  }

  return (
    <div className="org-wrap">
      <div className="org-tree">
        <div className="org-level-0">
          <div className="org-tree-node root-node">
            <div className="org-node-content">
              <div className="org-node-icon">🏢</div>
              <div className="org-node-title">全社</div>
              <div className="org-node-count">{emps.length}名</div>
            </div>
          </div>
          <div className="org-tree-line-v" />
        </div>
        <div className="org-level-1">
          <div className="org-tree-line-h" />
          <div className="org-level-children">
            {byDept.keys.map((dept) => {
              const members = byDept.map[dept];
              return (
                <div key={dept} className="org-branch">
                  <div className="org-tree-line-v-short" />
                  <div
                    className="org-tree-node dept-node"
                    onClick={() => onDeptClick?.(dept)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onDeptClick?.(dept);
                      }
                    }}
                  >
                    <div className="org-node-content">
                      <div className="org-node-icon">📁</div>
                      <div className="org-node-title">{dept}</div>
                      <div className="org-node-count">{members.length}名</div>
                    </div>
                  </div>
                  <div className="org-tree-line-v-short" />
                  <div className="org-members-box">
                    {members.map((emp) => (
                      <div
                        key={emp.id}
                        className="org-member-name"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                          }
                        }}
                      >
                        {emp.name}
                        {emp.position ? ` (${emp.position})` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
