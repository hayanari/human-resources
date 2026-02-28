/**
 * 社員データ Excel テンプレート生成
 * 資格・等級履歴・転籍履歴・スキル習熟度の列を含む
 */
import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ITEMS = ['施工管理', '測量', 'AutoCAD'];
const MAX_CERTS = 5;
const MAX_GRADE_HIST = 3;
const MAX_TRANSFER_HIST = 3;

const empHeaders = [
  '社員番号', '氏名', '所属', '部署', '役職', '職種', '等級', '号棒',
  'メールアドレス', '電話番号', '入社日', '生年月日', '郵便番号', '住所',
  '氏名変更日', '住所変更日', 'スキル', '備考',
];
for (let i = 1; i <= MAX_CERTS; i++) {
  empHeaders.push(`資格名${i}`, `資格取得日${i}`, `資格有効期限${i}`);
}
for (let i = 1; i <= MAX_GRADE_HIST; i++) {
  empHeaders.push(`等級履歴${i}_日付`, `等級履歴${i}_等級`, `等級履歴${i}_号棒`, `等級履歴${i}_理由`);
}
for (let i = 1; i <= MAX_TRANSFER_HIST; i++) {
  empHeaders.push(
    `転籍履歴${i}_日付`, `転籍履歴${i}_種類`, `転籍履歴${i}_異動前所属`, `転籍履歴${i}_異動前部署`,
    `転籍履歴${i}_異動後所属`, `転籍履歴${i}_異動後部署`, `転籍履歴${i}_理由`
  );
}
SKILL_ITEMS.forEach((sk) => empHeaders.push(`スキル_${sk}`));

const sampleRow1 = [
  'EMP001', '山田 太郎', '本社', '総務部', '主任', '施工管理', '2級', '5号',
  'yamada@example.com', '03-1234-5678', '2020-04-01', '1990-05-15', '100-0001', '東京都千代田区1-1',
  '', '', '施工管理, 測量', '',
  '1級土木施工管理技士', '2022-06-01', '2027-05-31',
  '2級土木施工管理技士', '2019-03-15', '2024-03-14',
  '', '', '', '', '', '', '', '', '', '',
  '2022-04-01', '2級', '5号', '昇格', '', '', '', '', '', '', '', '',
  '2020-04-01', '入社', '', '', '本社', '総務部', '入社による配属',
  '', '', '', '', '', '', '', '', '', '', '', '', '',
  3, 2, 2,
];

const evalHeaders = ['社員番号', '評価期間', '査定期間', '1次評価者', '2次評価者', 'コメント'];
const evalSample = ['EMP001', '2024年度', '2024/4-2025/3', '部長', '役員', ''];

const wb = XLSX.utils.book_new();
const ws1 = XLSX.utils.aoa_to_sheet([empHeaders, sampleRow1]);
XLSX.utils.book_append_sheet(wb, ws1, '社員マスタ');
const ws2 = XLSX.utils.aoa_to_sheet([evalHeaders, evalSample]);
XLSX.utils.book_append_sheet(wb, ws2, '人事評価');

const outPath = join(__dirname, '..', 'public', '社員データ_最新版.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Generated:', outPath);
