// Google Apps Script部署URL
const API_URL = "https://script.google.com/macros/s/AKfycbz0yFZjPjsur5siRnuKqVxIBgzOlBsqi93gn5OilVvAYYLhFv6h5UmlvK2b16pJjanH/exec";

// 當前過濾狀態
let currentFilter = "all";
let ricedumplingData = [];

// 頁面載入時獲取數據
document.addEventListener("DOMContentLoaded", () => {
    loadricedumplingData();
    setupFilterButtons();
});

async function loadricedumplingData() {
    try {
        document.getElementById("menu-container").innerHTML = 
            '<div class="loading">載入肉粽品項中...</div>';
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("網絡請求失敗");
        
        ricedumplingData = await response.json();
        displayMenuByCategory(ricedumplingData);
        updateTime();
    } catch (error) {
        console.error("獲取數據失敗:", error);
        document.getElementById("menu-container").innerHTML = 
            '<div class="loading">暫時無法獲取庫存信息，請稍後再試。</div>';
    }
}

function displayMenuByCategory(ricedumplings) {
    const menuContainer = document.getElementById("menu-container");
    
    if (!ricedumplings || ricedumplings.length === 0) {
        menuContainer.innerHTML = '<div class="loading">今日暫無供應品項</div>';
        return;
    }
    
    menuContainer.innerHTML = "";
    
    // 按分類分組
    const categories = {
        "特色粽": [],
        "北部粽": [],
        "南部粽": [],
        "其他": []
    };
    
    ricedumplings.forEach(ricedumpling => {
        const category = ricedumpling.分類 || "其他";
        if (categories[category]) {
            categories[category].push(ricedumpling);
        } else {
            categories["其他"].push(ricedumpling);
        }
    });
    
    // 為每個分類創建區塊
    for (const [categoryName, items] of Object.entries(categories)) {
        if (items.length === 0) continue;
        
        const categorySection = document.createElement("div");
        categorySection.className = "category-section";
        
        const categoryTitle = document.createElement("h2");
        categoryTitle.textContent = categoryName;
        categorySection.appendChild(categoryTitle);
        
        const ricedumplingList = document.createElement("div");
        ricedumplingList.className = "ricedumpling-list";
        
        // 根據當前過濾條件篩選肉粽
        const filteredItems = items.filter(ricedumpling => {
            const status = getStatusClass(ricedumpling.販售狀態);
            return currentFilter === "all" || status === currentFilter;
        });
        
        if (filteredItems.length === 0) {
            const emptyMsg = document.createElement("div");
            emptyMsg.className = "loading";
            emptyMsg.textContent = `此分類沒有符合條件的品項`;
            ricedumplingList.appendChild(emptyMsg);
        } else {
            filteredItems.forEach(ricedumpling => {
                ricedumplingList.appendChild(createRicedumplingItem(ricedumpling));
            });
        }
        
        categorySection.appendChild(ricedumplingList);
        menuContainer.appendChild(categorySection);
    }
}

function createRicedumplingItem(ricedumpling) {
    const statusClass = getStatusClass(ricedumpling.販售狀態);
    const statusText = getStatusText(ricedumpling.販售狀態);

    // 價格顯示
    let priceDisplay = `NT$ ${ricedumpling.價格}`;
    if (ricedumpling.組合價 && ricedumpling.組合數量) {
        priceDisplay += ` <span class="combo-price">(${ricedumpling.組合數量}顆 NT$ ${ricedumpling.組合價})</span>`;
    }

    const ricedumplingItem = document.createElement("div");
    ricedumplingItem.className = "ricedumpling-item";
    ricedumplingItem.innerHTML = `
        ${ricedumpling.原始URL ? `<img src="${ricedumpling.原始URL}" alt="${ricedumpling.品項名稱}" class="ricedumpling-image">` : ''}
        <div class="ricedumpling-name">${ricedumpling.品項名稱}</div>
        <div class="ricedumpling-price">${priceDisplay}</div>
        ${ricedumpling.描述 ? `<div class="ricedumpling-desc">${ricedumpling.描述}</div>` : ''}
        <div class="status ${statusClass}">${statusText}</div>
    `;
    
    return ricedumplingItem;
}

// 顯示庫存狀況
function getStatusClass(saleStatus) {
    if (!saleStatus) return "in-stock";
    if (saleStatus.includes("售完") || saleStatus.includes("缺貨")) return "sold-out";
    if (saleStatus.includes("冷凍")) return "frozen";
    if (saleStatus.includes("有熱")) return "hot";
    return "in-stock";
}

function getStatusText(saleStatus) {
    if (!saleStatus) return "現貨供應中";
    if (saleStatus.includes("售完")) return "已售完";
    if (saleStatus.includes("冷凍")) return "冷凍販售";
    if (saleStatus.includes("有熱")) return "現貨販售中";
    return saleStatus;
}


function updateTime() {
    const now = new Date();
    document.getElementById("update-time").textContent = 
        now.toLocaleString("zh-TW");
}

function setupFilterButtons() {
    const buttons = document.querySelectorAll(".filter-btn");
    
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentFilter = button.dataset.filter;
            displayMenuByCategory(ricedumplingData);
        });
    });
}

// 每5分鐘自動刷新一次
setInterval(loadricedumplingData, 5 * 60 * 1000);
