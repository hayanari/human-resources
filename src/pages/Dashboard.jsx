import { useApp } from '../context/AppContext';

export default function Dashboard({ content, onOpenLoadModal }) {
  const { emps, photoMap } = useApp();
  const dash = content?.dashboard || {};

  if (emps.length > 0) {
    const depts = [...new Set(emps.map((e) => e.dept))];
    return (
      <div className="stats-grid">
        <div className="sc">
          <div className="sc-top">
            <div className="sc-ico ib">👥</div>
          </div>
          <div className="sc-lbl">総社員数</div>
          <div className="sc-val">{emps.length}</div>
          <div className="sc-sub">名在籍</div>
        </div>
        <div className="sc">
          <div className="sc-top">
            <div className="sc-ico ig">🏢</div>
          </div>
          <div className="sc-lbl">部署数</div>
          <div className="sc-val">{depts.length}</div>
          <div className="sc-sub">部署</div>
        </div>
        <div className="sc">
          <div className="sc-top">
            <div className="sc-ico ip">📊</div>
          </div>
          <div className="sc-lbl">データ読込済</div>
          <div className="sc-val" style={{ color: 'var(--g)' }}>
            ✓
          </div>
          <div className="sc-sub">Excel + 写真{Object.keys(photoMap).length ? ` ${Object.keys(photoMap).length}枚` : ''}</div>
        </div>
      </div>
    );
  }

  const steps = dash.steps || [
    { n: 1, title: 'Excelを読み込む', desc: '社員データ.xlsxを選択' },
    { n: 2, title: '顔写真（任意）', desc: 'EMP001.jpgのように命名' },
    { n: 3, title: '全機能が使えます', desc: '評価・分析・配置を活用' },
  ];

  return (
    <div className="welcome">
      <div className="w-icon">📋</div>
      <div className="w-title">{dash.welcomeTitle || 'HRナビ Pro へようこそ'}</div>
      <div
        className="w-sub"
        dangerouslySetInnerHTML={{
          __html: dash.welcomeSub || '社員データ.xlsx と顔写真をまとめて読み込んで<br>タレントマネジメントを開始しましょう',
        }}
      />
      <div className="w-steps">
        {steps.map((s) => (
          <div key={s.n} className="w-step">
            <div className="w-step-n">{s.n}</div>
            <div className="w-step-t">{s.title}</div>
            <div className="w-step-d">{s.desc}</div>
          </div>
        ))}
      </div>
      <div
        onClick={() => onOpenLoadModal?.()}
        style={{ cursor: 'pointer' }}
        onKeyDown={(e) => e.key === 'Enter' && onOpenLoadModal?.()}
        role="button"
        tabIndex={0}
      >
        <div className="file-drop">
          <div className="fd-ico">📂</div>
          <div className="fd-txt">{dash.fileDropTitle || 'クリックしてデータを読み込む'}</div>
          <div className="fd-sub">{dash.fileDropSub || 'Excel ＋ 顔写真をまとめて選択できます'}</div>
        </div>
      </div>
    </div>
  );
}
