// Sample initial data representing analytical stats
let activeUsers = [
    { id: 1, name: "Olivia Johnson", email: "olivia.j@uunchai.com", role: "Administrator", status: "Active", conversionRate: "4.8%", sessionDuration: "14m 22s" },
    { id: 2, name: "Liam Smith", email: "liam.smith@uunchai.com", role: "Editor", status: "Inactive", conversionRate: "2.1%", sessionDuration: "4m 10s" },
    { id: 3, name: "Sophia Davis", email: "sophia.d@uunchai.com", role: "Contributor", status: "Active", conversionRate: "5.3%", sessionDuration: "18m 45s" },
    { id: 4, name: "Mason Miller", email: "mason.m@uunchai.com", role: "Administrator", status: "Active", conversionRate: "3.9%", sessionDuration: "11m 05s" },
    { id: 5, name: "Emma Wilson", email: "emma.w@uunchai.com", role: "Viewer", status: "Pending", conversionRate: "0.0%", sessionDuration: "0m 00s" },
    { id: 6, name: "Ethan Brown", email: "ethan.b@uunchai.com", role: "Contributor", status: "Active", conversionRate: "6.2%", sessionDuration: "22m 15s" }
];

// Tracks current sorting status
let currentSortCol = null;
let isAscending = true;

// DOM Elements
const tableBody = document.getElementById("table-body");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const totalUsersCount = document.getElementById("total-users-count");
const activeSessionsCount = document.getElementById("active-sessions-count");
const avgConversionRate = document.getElementById("avg-conversion-rate");
const addDataBtn = document.getElementById("add-data-btn");
const refreshDataBtn = document.getElementById("refresh-data-btn");
const toastContainer = document.getElementById("toast-container");

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
    renderTable();
    updateStatsCards();
    setupEventListeners();
});

// Setting up all listeners
function setupEventListeners() {
    // Search filter event
    searchInput.addEventListener("input", filterAndRender);
    
    // Status filter dropdown event
    statusFilter.addEventListener("change", filterAndRender);

    // Interactive Action: Add Demo Data
    addDataBtn.addEventListener("click", () => {
        addNewDemoUser();
    });

    // Interactive Action: Refresh Data
    refreshDataBtn.addEventListener("click", () => {
        refreshTableData();
    });
}

// Generate toast notification helper
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === "success" ? "✓" : "ℹ"}</span>
        <span class="toast-message">${message}</span>
    `;
    toastContainer.appendChild(toast);

    // Trigger animation frame for fade-in
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
        toast.addEventListener("transitionend", () => {
            toast.remove();
        });
    }, 3000);
}

// Render records in table dynamically
function renderTable(data = activeUsers) {
    tableBody.innerHTML = "";
    
    if (data.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
            <td colspan="6" class="empty-state">
                <div class="empty-state-content">
                    <span class="empty-icon">🔍</span>
                    <p>No matching users found.</p>
                </div>
            </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }

    data.forEach(user => {
        const row = document.createElement("tr");
        row.className = "fade-in-row";
        
        // Status Badge Style
        let statusClass = "badge-pending";
        if (user.status === "Active") statusClass = "badge-active";
        if (user.status === "Inactive") statusClass = "badge-inactive";

        row.innerHTML = `
            <td>
                <div class="user-info">
                    <div class="avatar">${user.name.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
            </td>
            <td><span class="role-text">${user.role}</span></td>
            <td><span class="badge ${statusClass}">${user.status}</span></td>
            <td class="text-right text-mono">${user.conversionRate}</td>
            <td class="text-right text-mono">${user.sessionDuration}</td>
            <td>
                <button class="btn-action" onclick="deleteUser(${user.id})" title="Delete User">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update the dynamic KPIs in the cards
function updateStatsCards() {
    totalUsersCount.textContent = activeUsers.length;
    
    const activeCount = activeUsers.filter(u => u.status === "Active").length;
    activeSessionsCount.textContent = activeCount;

    // Calculate average conversion rate
    const rates = activeUsers.map(u => parseFloat(u.conversionRate));
    const totalRate = rates.reduce((sum, current) => sum + current, 0);
    const average = rates.length ? (totalRate / rates.length).toFixed(1) : "0.0";
    avgConversionRate.textContent = `${average}%`;
}

// Function to handle filtering logic
function filterAndRender() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterStatus = statusFilter.value;

    const filtered = activeUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                              user.email.toLowerCase().includes(searchTerm) || 
                              user.role.toLowerCase().includes(searchTerm);
        
        const matchesStatus = filterStatus === "All" || user.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    renderTable(filtered);
}

// Handle column sorting
window.sortTable = function(column) {
    isAscending = currentSortCol === column ? !isAscending : true;
    currentSortCol = column;

    // Reset indicator icons in HTML headers
    document.querySelectorAll(".sortable").forEach(header => {
        header.classList.remove("asc", "desc");
    });

    const targetHeader = document.querySelector(`[data-col="${column}"]`);
    if (targetHeader) {
        targetHeader.classList.add(isAscending ? "asc" : "desc");
    }

    activeUsers.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Custom parsing for numbers or specific formatted metrics
        if (column === "conversionRate") {
            valA = parseFloat(valA);
            valB = parseFloat(valB);
        } else if (column === "sessionDuration") {
            // Converts e.g. "14m 22s" into seconds for correct sorting
            valA = convertTimeToSeconds(valA);
            valB = convertTimeToSeconds(valB);
        } else {
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
        }

        if (valA < valB) return isAscending ? -1 : 1;
        if (valA > valB) return isAscending ? 1 : -1;
        return 0;
    });

    filterAndRender();
    showToast(`Sorted data by ${column.replace(/([A-Z])/g, ' $1').toLowerCase()}`, "info");
}

// Helper to convert formatted time e.g., "14m 22s" to total seconds
function convertTimeToSeconds(timeString) {
    if (!timeString || timeString === "0m 00s") return 0;
    const parts = timeString.split(" ");
    let totalSeconds = 0;
    parts.forEach(part => {
        if (part.includes("m")) {
            totalSeconds += parseInt(part) * 60;
        } else if (part.includes("s")) {
            totalSeconds += parseInt(part);
        }
    });
    return totalSeconds;
}

// Action: Delete user row
window.deleteUser = function(userId) {
    const userIndex = activeUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        const userName = activeUsers[userIndex].name;
        activeUsers.splice(userIndex, 1);
        filterAndRender();
        updateStatsCards();
        showToast(`User "${userName}" was successfully removed`, "success");
    }
};

// Action: Generate and add a dynamic demo user
function addNewDemoUser() {
    const firstNames = ["James", "Lucas", "Aria", "Chloe", "Benjamin", "Charlotte", "Zoe", "Alexander", "Grace", "Henry"];
    const lastNames = ["Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez"];
    const roles = ["Administrator", "Editor", "Contributor", "Viewer"];
    const statuses = ["Active", "Inactive", "Pending"];

    const rName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const rEmail = `${rName.toLowerCase().replace(" ", ".")}@uunchai.com`;
    const rRole = roles[Math.floor(Math.random() * roles.length)];
    const rStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random conversion rate between 0% and 8%
    const rConversion = rStatus === "Pending" ? "0.0%" : `${(Math.random() * 8).toFixed(1)}%`;
    
    // Random minutes/seconds duration
    const rMin = Math.floor(Math.random() * 30);
    const rSec = Math.floor(Math.random() * 60);
    const rDuration = rStatus === "Pending" ? "0m 00s" : `${rMin}m ${rSec.toString().padStart(2, '0')}s`;

    const newUser = {
        id: activeUsers.length > 0 ? Math.max(...activeUsers.map(u => u.id)) + 1 : 1,
        name: rName,
        email: rEmail,
        role: rRole,
        status: rStatus,
        conversionRate: rConversion,
        sessionDuration: rDuration
    };

    activeUsers.push(newUser);
    filterAndRender();
    updateStatsCards();
    showToast(`Added new user "${newUser.name}"`, "success");

    // Auto scroll the table view down slightly if user wants to see the table
    const tableContainer = document.querySelector(".table-responsive");
    if (tableContainer) {
        tableContainer.scrollTo({
            top: tableContainer.scrollHeight,
            behavior: "smooth"
        });
    }
}

// Action: Reset/Refresh demo data to initial pool
function refreshTableData() {
    activeUsers = [
        { id: 1, name: "Olivia Johnson", email: "olivia.j@uunchai.com", role: "Administrator", status: "Active", conversionRate: "4.8%", sessionDuration: "14m 22s" },
        { id: 2, name: "Liam Smith", email: "liam.smith@uunchai.com", role: "Editor", status: "Inactive", conversionRate: "2.1%", sessionDuration: "4m 10s" },
        { id: 3, name: "Sophia Davis", email: "sophia.d@uunchai.com", role: "Contributor", status: "Active", conversionRate: "5.3%", sessionDuration: "18m 45s" },
        { id: 4, name: "Mason Miller", email: "mason.m@uunchai.com", role: "Administrator", status: "Active", conversionRate: "3.9%", sessionDuration: "11m 05s" },
        { id: 5, name: "Emma Wilson", email: "emma.w@uunchai.com", role: "Viewer", status: "Pending", conversionRate: "0.0%", sessionDuration: "0m 00s" },
        { id: 6, name: "Ethan Brown", email: "ethan.b@uunchai.com", role: "Contributor", status: "Active", conversionRate: "6.2%", sessionDuration: "22m 15s" }
    ];
    searchInput.value = "";
    statusFilter.value = "All";
    
    // Clear sorting status indicators
    document.querySelectorAll(".sortable").forEach(header => {
        header.classList.remove("asc", "desc");
    });
    currentSortCol = null;

    renderTable();
    updateStatsCards();
    showToast("Metrics and users reset to initial values", "info");
}
