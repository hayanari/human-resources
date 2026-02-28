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

  const addEmployee = useCallback(async (emp) => {
    const newEmp = {
      id: emp.id?.trim() || `EMP${Date.now().toString().slice(-6)}`,
      name: emp.name?.trim() || '',
      belong: emp.belong || '', dept: emp.dept || '', position: emp.position || '',
      jobType: emp.jobType || '', grade: emp.grade || '', goubou: emp.goubou || '',
      email: emp.email || '', phone: emp.phone || '',
      joined: emp.joined || '', dob: emp.dob || '', zip: emp.zip || '', address: emp.address || '',
      nameChanged: emp.nameChanged || '', addressChanged: emp.addressChanged || '',
      skills: emp.skills || [], notes: emp.notes || '',
      certs: emp.certs || [], gradeHistory: emp.gradeHistory || [], transferHistory: emp.transferHistory || [],
      skillLevels: emp.skillLevels || {},
    };
    const exists = emps.some((e) => e.id === newEmp.id);
    if (exists) return { ok: false, msg: `社員番号「${newEmp.id}」は既に存在します` };
    setEmps((prev) => {
      const next = [...prev, newEmp];
      persistData(next, evals, photoMap);
      return next;
    });
    const sb = window.supabaseClient;
    if (sb) {
      try {
        await sb.from('employees').insert({
          id: newEmp.id, name: newEmp.name, belong: newEmp.belong || null, dept: newEmp.dept || null,
          position: newEmp.position || null, job_type: newEmp.jobType || null, grade: newEmp.grade || null,
          goubou: newEmp.goubou || null, email: newEmp.email || null, phone: newEmp.phone || null,
          joined: newEmp.joined || null, dob: newEmp.dob || null, zip: newEmp.zip || null, address: newEmp.address || null,
          name_changed: newEmp.nameChanged || null, address_changed: newEmp.addressChanged || null,
          skills: newEmp.skills || [], notes: newEmp.notes || null, certs: newEmp.certs || [],
          grade_history: newEmp.gradeHistory || [], transfer_history: newEmp.transferHistory || [],
          skill_levels: newEmp.skillLevels || {},
        });
      } catch (err) {
        console.warn('Supabase insert failed:', err);
      }
    }
    return { ok: true, id: newEmp.id };
  }, [emps, evals, photoMap, persistData]);

  const updateEmployee = useCallback(async (empId, updates) => {
    setEmps((prev) => {
      const next = prev.map((e) => (e.id === empId ? { ...e, ...updates } : e));
      persistData(next, evals, photoMap);
      return next;
    });
    const sb = window.supabaseClient;
    if (sb && updates.skillLevels !== undefined) {
      try {
        await sb.from('employees').update({ skill_levels: updates.skillLevels, updated_at: new Date().toISOString() }).eq('id', empId);
      } catch (err) {
        console.warn('Supabase skill update failed:', err);
      }
    }
  }, [evals, photoMap, persistData]);

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
    addEmployee,
    updateEmployee,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
