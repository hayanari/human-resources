const STORAGE_KEY = 'hr-skills';
const DEFAULT_SKILLS = ['施工管理', '測量', 'AutoCAD'];

export function getSkillItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SKILLS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_SKILLS];
  } catch {
    return [...DEFAULT_SKILLS];
  }
}

export function setSkillItems(items) {
  const arr = Array.isArray(items) ? items : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  return arr;
}

export function addSkillItem(name) {
  const items = getSkillItems();
  const trimmed = String(name || '').trim();
  if (!trimmed || items.includes(trimmed)) return items;
  const next = [...items, trimmed];
  setSkillItems(next);
  return next;
}

export function removeSkillItem(name) {
  const items = getSkillItems().filter((s) => s !== name);
  setSkillItems(items);
  return items;
}

export { DEFAULT_SKILLS };
