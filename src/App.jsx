import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import LoginOverlay from './components/LoginOverlay';
import LoadModal from './components/LoadModal';
import SkillSetModal from './components/SkillSetModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import SkillMap from './pages/SkillMap';
import Org from './pages/Org';
import Certs from './pages/Certs';
import { exportToExcel } from './lib/exportExcel';

function App() {
  const { currentUser, restoreSession, loadData, emps, evals } = useApp();
  const [content, setContent] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [skillSetModalOpen, setSkillSetModalOpen] = useState(false);
  const [skillItemsVersion, setSkillItemsVersion] = useState(0);
  const [addEmpModalOpen, setAddEmpModalOpen] = useState(false);
  const [initialDeptFilter, setInitialDeptFilter] = useState('');

  useEffect(() => {
    fetch('/content.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setContent(data))
      .catch(() => setContent(null));
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (currentUser) loadData();
  }, [currentUser, loadData]);

  if (!currentUser) {
    return (
      <>
        <LoginOverlay content={content} />
      </>
    );
  }

  const pageTitle = content?.pages?.[page]?.title || page;
  const topbar = content?.topbar || {};

  return (
    <>
      <Sidebar content={content} page={page} setPage={setPage} />
      <div className="main">
        <header className="topbar">
          <div className="top-title">{pageTitle}</div>
          <div className="top-acts">
            <button className="btn btn-s" onClick={() => setLoadModalOpen(true)}>
              {topbar.loadData || '📂 データ読み込み'}
            </button>
            <button
              className="btn btn-p"
              onClick={() => setAddEmpModalOpen(true)}
            >
              {topbar.addEmp || '＋ 社員追加'}
            </button>
            <button
              className="btn btn-g"
              onClick={() => {
                if (exportToExcel(emps, evals)) {
                  alert('Excelを保存しました');
                } else {
                  alert('XLSX ライブラリが読み込まれていません');
                }
              }}
            >
              {topbar.saveExcel || '💾 Excel保存'}
            </button>
          </div>
        </header>
        <div className="content">
          <div className={`page ${page === 'dashboard' ? 'active' : ''}`}>
            {page === 'dashboard' && <Dashboard content={content} onOpenLoadModal={() => setLoadModalOpen(true)} />}
          </div>
          <div className={`page ${page === 'employees' ? 'active' : ''}`}>
            {page === 'employees' && (
              <Employees
                content={content}
                onOpenAddEmp={() => setAddEmpModalOpen(true)}
                initialDeptFilter={initialDeptFilter}
                onClearInitialDeptFilter={() => setInitialDeptFilter('')}
              />
            )}
          </div>
          <div className={`page ${page === 'skillmap' ? 'active' : ''}`}>
            {page === 'skillmap' && (
              <SkillMap
                onOpenSkillSettings={() => setSkillSetModalOpen(true)}
                skillItemsVersion={skillItemsVersion}
              />
            )}
          </div>
          <div className={`page ${page === 'certs' ? 'active' : ''}`}>
            {page === 'certs' && <Certs />}
          </div>
          <div className={`page ${page === 'org' ? 'active' : ''}`}>
            {page === 'org' && (
              <Org
                onDeptClick={(dept) => {
                  setInitialDeptFilter(dept);
                  setPage('employees');
                }}
              />
            )}
          </div>
          {page !== 'dashboard' && page !== 'employees' && page !== 'skillmap' && page !== 'certs' && page !== 'org' && (
            <div className={`page active`}>
              <div className="empty">
                <div className="empty-ico">📄</div>
                <div className="empty-txt">{content?.pages?.[page]?.title || page}</div>
                <div className="empty-sub">準備中</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {loadModalOpen && (
        <LoadModal
          onClose={() => setLoadModalOpen(false)}
          onLoaded={() => setLoadModalOpen(false)}
        />
      )}
      {skillSetModalOpen && (
        <SkillSetModal
          onClose={() => setSkillSetModalOpen(false)}
          onSaved={() => setSkillItemsVersion((v) => v + 1)}
        />
      )}
      {addEmpModalOpen && (
        <AddEmployeeModal
          onClose={() => setAddEmpModalOpen(false)}
          onSaved={() => setAddEmpModalOpen(false)}
        />
      )}
    </>
  );
}

export default App;
