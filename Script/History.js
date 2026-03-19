/* ── TIME FORMAT FUNCTION (FIX TIMEZONE) ── */
function formatTime(timestamp) {
    if (!timestamp) return "-";

    return new Date(timestamp).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

/* ── LOAD HISTORY ── */
async function loadHistory() {
    const { data, error } = await supabaseClient
        .from("entry_logs")
        .select(`
            entry_time, exit_time, status, plate_number,
            vehicles (full_name, plate_number, vehicle_type, rfid_inside, rfid_outside)
        `)
        .order("entry_time", { ascending: false });

    const tbody = document.getElementById("historyTableBody");

    if (error) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#ef4444;">Error loading history</td></tr>`;
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#999;">No history records found</td></tr>`;
        return;
    }

    tbody.innerHTML = "";

    data.forEach(log => {

        /* ✅ DURATION CALCULATION */
        let duration = "-";
        if (log.exit_time) {
            const diff    = (new Date(log.exit_time) - new Date(log.entry_time)) / 60000;
            const hours   = Math.floor(diff / 60);
            const minutes = Math.floor(diff % 60);
            duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} mins`;
        }

        /* ✅ FIXED TIME DISPLAY */
        const entryTime = formatTime(log.entry_time);
        const exitTime  = log.exit_time ? formatTime(log.exit_time) : "-";

        const statusClass = log.status === "inside" ? "in" : "out";
        const rfidNumber  = log.vehicles?.rfid_inside || log.vehicles?.rfid_outside || "-";

        tbody.innerHTML += `
            <tr>
                <td>${log.vehicles?.full_name || "-"}</td>
                <td>${log.plate_number || log.vehicles?.plate_number || "-"}</td>
                <td>${log.vehicles?.vehicle_type || "-"}</td>
                <td>${rfidNumber}</td>
                <td>${entryTime}</td>
                <td>${exitTime}</td>
                <td>${duration}</td>
                <td><span class="status-badge ${statusClass}">${log.status.toUpperCase()}</span></td>
            </tr>`;
    });
}

/* ── INIT ── */
window.onload = () => {
    loadHistory();
    document.getElementById('downloadBtn').addEventListener('click', downloadCSV);
};

/* ── DOWNLOAD CSV ── */
function downloadCSV() {
    const headers = ['Full Name','Plate Number','Type','RFID #','Entry Time','Exit Time','Duration Inside','Status'];
    const rows = [...document.querySelectorAll('#historyTableBody tr')].map(tr =>
        [...tr.querySelectorAll('td')].map(td => `"${td.innerText.replace(/"/g, '""')}"`)
    ).filter(r => r.length > 1);

    if (!rows.length) return;

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `history_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
}