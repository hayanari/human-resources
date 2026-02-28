import { useState, useEffect } from 'react';
import { getSkillItems, setSkillItems } from '../lib/skillItems';

export default function SkillSetModal({ onClose, onSaved }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems([...getSkillItems()]);
  }, []);

  const addRow = () => {
    setItems((prev) => [...prev, '']);
  };

  const updateRow = (i, val) => {
    setItems((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const removeRow = (i) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const save = () => {
    const trimmed = items
      .map((s) => String(s || '').trim())
      .filter(Boolean);
    const unique = [...new Set(trimmed)];
    setSkillItems(unique);
    onSaved?.();
    onClose();
  };

  return (
    <div className="mo open">
      <div className="mo-box" style={{ maxWidth: 420 }}>
        <div className="mo-hd">
          <div className="mo-title">⚙️ スキル項目設定</div>
          <button className="mo-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="mo-body">
          <p style={{ fontSize: 13, color: 'var(--txm)', marginBottom: 14 }}>
            スキルマップに表示する項目を追加・削除できます。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  className="finp"
                  value={item}
                  onChange={(e) => updateRow(i, e.target.value)}
                  placeholder="例: 施工管理"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-d btn-sm"
                  onClick={() => removeRow(i)}
                  title="削除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-s btn-sm"
            style={{ marginTop: 10 }}
            onClick={addRow}
          >
            ＋ スキル項目を追加
          </button>
        </div>
        <div className="mo-ft">
          <button className="btn btn-s" onClick={onClose}>
            キャンセル
          </button>
          <button className="btn btn-p" onClick={save}>
            💾 保存
          </button>
        </div>
      </div>
    </div>
  );
}
