/**
 * Excel export - 資格・等級・転籍・スキルを含むフル形式
 */
import { getSkillItems } from './skillItems';

function buildEmpHeaders(emps) {
  const base = [
    '社員番号', '氏名', '所属', '部署', '役職', '職種', '等級', '号棒',
    'メールアドレス', '電話番号', '入社日', '生年月日', '郵便番号', '住所',
    '氏名変更日', '住所変更日', 'スキル', '備考',
  ];
  const maxCerts = Math.max(1, ...emps.map((e) => (e.certs || []).length));
  const maxGrade = Math.max(1, ...emps.map((e) => (e.gradeHistory || []).length));
  const maxTransfer = Math.max(1, ...emps.map((e) => (e.transferHistory || []).length));
  for (let i = 1; i <= maxCerts; i++) {
    base.push('資格名' + i, '資格取得日' + i, '資格有効期限' + i);
  }
  for (let i = 1; i <= maxGrade; i++) {
    base.push('等級履歴' + i + '_日付', '等級履歴' + i + '_等級', '等級履歴' + i + '_号棒', '等級履歴' + i + '_理由');
  }
  for (let i = 1; i <= maxTransfer; i++) {
    base.push('転籍履歴' + i + '_日付', '転籍履歴' + i + '_種類', '転籍履歴' + i + '_異動前所属', '転籍履歴' + i + '_異動前部署', '転籍履歴' + i + '_異動後所属', '転籍履歴' + i + '_異動後部署', '転籍履歴' + i + '_理由');
  }
  getSkillItems().forEach((sk) => base.push('スキル_' + sk));
  return { headers: base, maxCerts, maxGrade, maxTransfer };
}

function empToRow(e, maxCerts, maxGrade, maxTransfer) {
  const r = [
    e.id, e.name, e.belong || '', e.dept || '', e.position || '', e.jobType || '', e.grade || '', e.goubou || '',
    e.email || '', e.phone || '', e.joined || '', e.dob || '', e.zip || '', e.address || '',
    e.nameChanged || '', e.addressChanged || '',
    (e.skills || []).join(', '), e.notes || '',
  ];
  for (let i = 0; i < maxCerts; i++) {
    const c = (e.certs || [])[i] || {};
    r.push(c.name || '', c.acquired || '', c.expiry || '');
  }
  for (let i = 0; i < maxGrade; i++) {
    const g = (e.gradeHistory || [])[i] || {};
    r.push(g.date || '', g.grade || '', g.goubou || '', g.reason || '');
  }
  for (let i = 0; i < maxTransfer; i++) {
    const t = (e.transferHistory || [])[i] || {};
    r.push(t.date || '', t.type || '', t.fromBelong || '', t.fromDept || '', t.toBelong || '', t.toDept || '', t.reason || '');
  }
  getSkillItems().forEach((sk) => r.push((e.skillLevels || {})[sk] ?? 0));
  return r;
}

export function exportToExcel(emps, evals) {
  const XLSX = window.XLSX;
  if (!XLSX) return false;
  const { headers, maxCerts, maxGrade, maxTransfer } = buildEmpHeaders(emps);
  const empRows = emps.map((e) => empToRow(e, maxCerts, maxGrade, maxTransfer));
  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...empRows]);
  const evalHeaders = ['社員番号', '評価期間', '査定期間', '1次評価者', '2次評価者', 'コメント'];
  const evalRows = (evals || []).map((v) => [v.empId, v.period || '', v.satei || '', v.eval1st || '', v.eval2nd || '', v.comment || '']);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, '社員マスタ');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([evalHeaders, ...evalRows]), '人事評価');
  XLSX.writeFile(wb, '社員データ_最新版.xlsx');
  return true;
}
