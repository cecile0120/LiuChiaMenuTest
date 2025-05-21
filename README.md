# LiuChiaMenuTest

## 🔧 功能說明

- ✅ 顯示所有肉粽品項
- 📦 根據分類顯示（特色粽、北部粽、南部粽、其他）
- 🔄 自動從 Google Apps Script API 獲取資料
- 🧊 標示供應狀況：現貨、冷凍、已售完
- 🔍 點擊按鈕篩選供應狀態
- 🖼️ 圖片、價格、組合價、敘述完整顯示

## 🌐 API 來源

此專案使用 Google Apps Script 部署的 API 作為資料來源。

請於 `scripts/main.js` 檔案內確認：

```javascript
const API_URL = "https://script.google.com/macros/s/你的AppsScript網址/exec";
