import { useApp } from '../context/AppContext';

function roleLabel(r) {
  return { admin: '管理者', evaluator: '評価者', viewer: '閲覧者' }[r] || r;
}

function roleBadgeClass(r) {
  return { admin: 'role-bdg-admin', evaluator: 'role-bdg-evaluator', viewer: 'role-bdg-viewer' }[r] || 'role-bdg-viewer';
}

export default function Sidebar({ content, page, setPage }) {
  const { currentUser, logout } = useApp();
  const app = content?.app || {};
  const nav = content?.nav || {};
  const sections = nav.sections || [];
  const foot = nav.foot || [];

  const handleFootAction = (item) => {
    if (item.action === 'logout') logout();
    if (item.action === 'nav_userMgmt') {
      // TODO: open user management modal
    }
    if (item.action === 'changePw') {
      // TODO: open change password modal
    }
  };

  return (
    <nav className="sb">
      <div className="sb-logo">
        <div className="sb-mark">H</div>
        <div>
          <div className="sb-text">HR<span>ナビ</span></div>
          <div className="sb-ver">{app.version || 'Pro v3.0'}</div>
        </div>
      </div>
      <div className="sb-nav">
        {sections.map((sec) => (
          <div key={sec.label} className="sb-sec">
            <div className="sb-sec-lbl">{sec.label}</div>
            {(sec.items || []).map((it) => (
              <div
                key={it.page}
                className={`sb-item ${it.badge ? 'sb-badge-wrap' : ''} ${page === it.page ? 'active' : ''}`}
                onClick={() => setPage(it.page)}
                data-page={it.page}
              >
                <span className="sb-ico">{it.icon}</span>
                {it.label}
                {it.badge && <span className="sb-badge" id={it.badge}></span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sb-foot">
        <div>{app.subtitle || 'Excel連携 · OneDrive対応'}</div>
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--bdr)', marginTop: 'auto' }}>
          {currentUser && (
            <div className="user-chip" style={{ marginBottom: '8px' }}>
              <div className="user-av">{currentUser.name?.charAt(0)}</div>
              <span className="user-name">{currentUser.name}</span>
              <span className={`user-role-bdg ${roleBadgeClass(currentUser.role)}`}>
                {roleLabel(currentUser.role)}
              </span>
            </div>
          )}
          {foot.map((item) => (
            <div
              key={item.action || item.label}
              className="sb-item"
              id={item.id}
              onClick={() => handleFootAction(item)}
              style={typeof item.style === 'object' && item.style !== null ? item.style : undefined}
            >
              <span className="sb-ico">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
