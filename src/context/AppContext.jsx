import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

const AUTH_KEY = 'hr-users-v1';
const SESSION_KEY = 'hr-session-v1';
const LS_DATA_KEY = 'hr-data-v3';

const DEFAULT_USERS = [
  { id: 'admin', name: 'システム管理者', role: 'admin', dept: '' },
  { id: 'evaluator1', name: '評価者1', role: 'evaluator', dept: '' },
  { id: 'viewer1', name: '閲覧者1', role: 'viewer', dept: '' },
];

function hashPw(str) {
  const salt = 'HRnavi2025_';
  let s = salt + str + salt;
  for (let i = 0; i < 3; i++) {
    try {
      s = btoa(unescape(encodeURIComponent(s)));
    } catch (e) {
      s = btoa(s);
    }
  }
  while (s.length < 64) s = s + s;
  return s.slice(0, 64).replace(/[+\/=]/g, (c) => ({ '+': 'a', '/': 'b', '=': 'c' }[c]));
}

function getUsers() {
  const r = localStorage.getItem(AUTH_KEY);
  if (!r) return null;
  try {
    return JSON.parse(r);
  } catch (e) {
    return null;
  }
}

function saveUsers(u) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(u));
}

function initUsers() {
  let u = getUsers();
  if (!u) {
    u = DEFAULT_USERS.map((x) => {
      const pw = x.id === 'admin' ? 'admin123' : x.id === 'evaluator1' ? 'eval123' : 'view123';
      return { ...x, pwHash: hashPw(pw) };
    });
    saveUsers(u);
  }
  return u;
}

export function AppProvider({ children }) {
  const [emps, setEmps] = useState([]);
  const [evals, setEvals] = useState([]);
  const [photoMap, setPhotoMap] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const doLogin = useCallback((userId, password) => {
    initUsers();
    const users = getUsers();
    const user = users?.find((u) => u.id === userId);
    if (!user) return { ok: false, msg: 'ユーザーIDが見つかりません' };
    if (hashPw(password) !== user.pwHash) return { ok: false, msg: 'パスワードが正しくありません' };
    setCurrentUser({ ...user });
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, at: Date.now() }));
    return { ok: true, user };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const restoreSession = useCallback(() => {
    initUsers();
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    try {
      const s = JSON.parse(raw);
      if (Date.now() - s.at > 8 * 3600 * 1000) {
        localStorage.removeItem(SESSION_KEY);
        return false;
      }
      const users = getUsers();
      const user = users?.find((u) => u.id === s.userId);
      if (!user) return false;
      setCurrentUser({ ...user });
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const loadData = useCallback(async () => {
    const sb = window.supabaseClient;
    if (sb) {
      try {
        const { data: eData, error: eErr } = await sb.from('employees').select('*');
        if (!eErr && eData?.length) {
          const { data: vData, error: vErr } = await sb.from('evaluations').select('*');
          if (!vErr) {
            const rowToEmp = (r) => ({
              id: r.id, name: r.name, belong: r.belong || '', dept: r.dept || '', position: r.position || '',
              jobType: r.job_type || '', grade: r.grade || '', goubou: r.goubou || '', email: r.email || '',
              phone: r.phone || '', joined: r.joined || '', dob: r.dob || '', zip: r.zip || '', address: r.address || '',
              nameChanged: r.name_changed || '', addressChanged: r.address_changed || '', skills: r.skills || [],
              notes: r.notes || '', certs: r.certs || [], gradeHistory: r.grade_history || [],
              transferHistory: r.transfer_history || [], skillLevels: r.skill_levels || {},
            });
            const rowToEval = (r) => ({
              empId: r.emp_id, period: r.period || '', satei: r.satei || '', eval1st: r.eval_1st || '',
              eval2nd: r.eval_2nd || '', comment: r.comment || '', compScores: r.comp_scores || {},
              kpiScores: r.kpi_scores || {}, ...(r.id && { id: r.id }),
            });
            setEmps((eData || []).map(rowToEmp));
            setEvals((vData || []).map(rowToEval));
            return true;
          }
        }
      } catch (e) {
        console.warn('Supabase load failed:', e);
      }
    }
    const d = localStorage.getItem(LS_DATA_KEY);
    if (d) {
      try {
        const parsed = JSON.parse(d);
        if (parsed.emps) setEmps(parsed.emps);
        if (parsed.evals) setEvals(parsed.evals);
        if (parsed.photoMap) setPhotoMap(parsed.photoMap);
      } catch (e) {}
    }
    return false;
  }, []);

  const persistData = useCallback((empsData, evalsData, photoMapData) => {
    localStorage.setItem(LS_DATA_KEY, JSON.stringify({
      emps: empsData, evals: evalsData, photoMap: photoMapData,
    }));
  }, []);

  const value = {
    emps,
    evals,
    photoMap,
    setEmps,
    setEvals,
    setPhotoMap,
    currentUser,
    setCurrentUser,
    doLogin,
    logout,
    restoreSession,
    loadData,
    persistData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
