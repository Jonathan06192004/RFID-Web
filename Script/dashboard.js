const PH_LOCALE = "en-PH";
const PH_TZ = { timeZone: "Asia/Manila" };

function formatPHTime(timestamp) {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString(PH_LOCALE, { ...PH_TZ, hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatPHDateTime(timestamp) {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString(PH_LOCALE, { ...PH_TZ, year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

async function loadDashboardData() {
    const { data, error } = await supabaseClient
        .from("entry_logs")
        .select(`
            entry_time, exit_time, status, plate_number,
            vehicles:vehicle_id (full_name, plate_number, vehicle_type, rfid_inside, rfid_outside)
        `)
        .order("entry_time", { ascending: false });

    if (error) {
        console.error("Supabase error:", error);
        return;
    }

    // Stats Logic — compare using Manila midnight
    const nowManila = new Date(new Date().toLocaleString(PH_LOCALE, PH_TZ));
    nowManila.setHours(0, 0, 0, 0);
    const todayData = data.filter(e => new Date(e.entry_time) >= nowManila);

    document.getElementById("currentInside").textContent = data.filter(e => e.status === "inside").length;
    document.getElementById("totalExits").textContent = todayData.filter(e => e.exit_time !== null).length;
    document.getElementById("totalEntries").textContent = todayData.length;

    // Live Table
    const liveTable = document.getElementById("liveEntryTableBody");
    liveTable.innerHTML = "";
    const latestLogs = data.slice(0, 10);

    if (latestLogs.length === 0) {
        liveTable.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:#999;">No records found</td></tr>`;
    } else {
        latestLogs.forEach(entry => {
            const logTime = entry.status === "inside" ? entry.entry_time : entry.exit_time;
            const time = formatPHTime(logTime);
            const statusClass = entry.status === "inside" ? "in" : "out";
            const row = `
                <tr>
                    <td>${entry.vehicles?.full_name || "-"}</td>
                    <td>${entry.plate_number || entry.vehicles?.plate_number || "-"}</td>
                    <td>${entry.vehicles?.vehicle_type || "-"}</td>
                    <td>${time}</td>
                    <td><span class="status-badge ${statusClass}">${entry.status.toUpperCase()}</span></td>
                </tr>`;
            liveTable.innerHTML += row;
        });
    }

    // History Table
    const historyTable = document.getElementById("historyTableBody");
    historyTable.innerHTML = "";
    data.forEach(entry => {
        const exitTime = entry.exit_time ? new Date(entry.exit_time) : null;
        let duration = "-";
        if (exitTime) {
            const diffMinutes = Math.floor((exitTime - new Date(entry.entry_time)) / 60000);
            duration = diffMinutes >= 60 ? `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m` : `${diffMinutes} mins`;
        }
        const row = `
            <tr>
                <td>${entry.vehicles?.full_name || "-"}</td>
                <td>${entry.vehicles?.vehicle_type || "-"}</td>
                <td>${entry.vehicles?.rfid_inside || "-"}</td>
                <td>${formatPHDateTime(entry.entry_time)}</td>
                <td>${formatPHDateTime(entry.exit_time)}</td>
                <td>${duration}</td>
            </tr>`;
        historyTable.innerHTML += row;
    });
}

function enableRealtimeUpdates() {
    supabaseClient.channel('entry_logs_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'entry_logs' }, () => loadDashboardData())
        .subscribe();
}

window.onload = () => {
    loadDashboardData();
    enableRealtimeUpdates();
    setInterval(loadDashboardData, 30000);
};