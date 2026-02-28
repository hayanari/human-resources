import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AddEmployeeModal({ onClose, onSaved }) {
  const { emps, addEmployee } = useApp();
  const [form, setForm] = useState({
    id: '',
    name: '',
    belong: '',
    dept: '',
    position: '',
    jobType: '',
    grade: '',
    goubou: '',
    email: '',
    phone: '',
    joined: '',
    dob: '',
    skills: '',
    notes: '',
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    const name = form.name?.trim();
    if (!name) {
      alert('氏名を入力してください');
      return;
    }
    const emp = {
      ...form,
      id: form.id?.trim() || undefined,
      skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    const result = await addEmployee(emp);
    if (result?.ok) {
      onSaved?.();
      onClose();
    } else if (result?.msg) {
      alert(result.msg);
    }
  };

  const depts = [...new Set(emps.map((e) => e.dept).filter(Boolean))].sort();
  const belongs = [...new Set(emps.map((e) => e.belong).filter(Boolean))].sort();

  return (
    <div className="mo open">
      <div className="mo-box mo-xl">
        <div className="mo-hd">
          <div className="mo-title">社員を追加</div>
          <button className="mo-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="mo-body">
          <div className="fg2" style={{ marginBottom: 14 }}>
            <div className="fg">
              <label>氏名 *</label>
              <input
                className="finp"
                placeholder="山田 太郎"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div className="fg">
              <label>社員番号</label>
              <input
                className="finp"
                placeholder="EMP001（空欄で自動作成）"
                value={form.id}
                onChange={(e) => update('id', e.target.value)}
              />
            </div>
          </div>
          <div className="fg2" style={{ marginBottom: 14 }}>
            <div className="fg">
              <label>所属</label>
              <input
                className="finp"
                placeholder="本社"
                value={form.belong}
                onChange={(e) => update('belong', e.target.value)}
                list="add-emp-belong"
              />
              <datalist id="add-emp-belong">
                {belongs.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div className="fg">
              <label>部署</label>
              <input
                className="finp"
                placeholder="総務部"
                value={form.dept}
                onChange={(e) => update('dept', e.target.value)}
                list="add-emp-dept"
              />
              <datalist id="add-emp-dept">
                {depts.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="fg2" style={{ marginBottom: 14 }}>
            <div className="fg">
              <label>役職</label>
              <input
                className="finp"
                placeholder="主任"
                value={form.position}
                onChange={(e) => update('position', e.target.value)}
              />
            </div>
            <div className="fg">
              <label>職種</label>
              <input
                className="finp"
                placeholder="施工管理"
                value={form.jobType}
                onChange={(e) => update('jobType', e.target.value)}
              />
            </div>
          </div>
          <div className="fg2" style={{ marginBottom: 14 }}>
            <div className="fg">
              <label>等級</label>
              <input
                className="finp"
                placeholder="2級"
                value={form.grade}
                onChange={(e) => update('grade', e.target.value)}
              />
            </div>
            <div className="fg">
              <label>号棒</label>
              <input
                className="finp"
                placeholder="5号"
                value={form.goubou}
                onChange={(e) => update('goubou', e.target.value)}
              />
            </div>
          </div>
          <div className="fg2" style={{ marginBottom: 14 }}>
            <div className="fg">
              <label>メールアドレス</label>
              <input
                className="finp"
                type="email"
                placeholder="yamada@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            <div className="fg">
              <label>電話番号</label>
              <input
                className="finp"
                placeholder="03-1234-5678"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </div>
          <div className="fg2" style={{ marginBottom: 14 }}>
            <div className="fg">
              <label>入社日</label>
              <input
                className="finp"
                type="date"
                value={form.joined}
                onChange={(e) => update('joined', e.target.value)}
              />
            </div>
            <div className="fg">
              <label>生年月日</label>
              <input
                className="finp"
                type="date"
                value={form.dob}
                onChange={(e) => update('dob', e.target.value)}
              />
            </div>
          </div>
          <div className="fg" style={{ marginBottom: 14 }}>
            <label>スキル（カンマ区切り）</label>
            <input
              className="finp"
              placeholder="施工管理, 測量, AutoCAD"
              value={form.skills}
              onChange={(e) => update('skills', e.target.value)}
            />
          </div>
          <div className="fg">
            <label>備考</label>
            <textarea
              className="finp"
              placeholder="特記事項"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
        </div>
        <div className="mo-ft">
          <button className="btn btn-s" onClick={onClose}>
            キャンセル
          </button>
          <button className="btn btn-p" onClick={handleSave}>
            💾 保存
          </button>
        </div>
      </div>
    </div>
  );
}
