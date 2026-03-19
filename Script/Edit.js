/* ── LOAD VEHICLES ── */
async function loadVehicles() {
    const { data, error } = await supabaseClient
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

    const tbody = document.getElementById("vehiclesTableBody");

    if (error) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:40px;">Error loading vehicles</td></tr>`;
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#999;">No vehicles found</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    data.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${v.full_name}</td>
                <td>${v.plate_number}</td>
                <td>${v.vehicle_type}</td>
                <td>${v.rfid_inside || "-"}</td>
                <td>${v.rfid_outside || "-"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit" onclick="openEditModal('${v.id}','${v.full_name}','${v.plate_number}','${v.vehicle_type}','${v.rfid_inside || ""}','${v.rfid_outside || ""}')" title="Edit">✏️</button>
                        <button class="icon-btn delete" onclick="openDeleteModal('${v.id}')" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>`;
    });
}

/* ── EDIT MODAL ── */
function openEditModal(id, fullName, plateNumber, vehicleType, rfidInside, rfidOutside) {
    document.getElementById("editVehicleId").value    = id;
    document.getElementById("editFullName").value     = fullName;
    document.getElementById("editPlateNumber").value  = plateNumber;
    document.getElementById("editVehicleType").value  = vehicleType;
    document.getElementById("editRfidInside").value   = rfidInside;
    document.getElementById("editRfidOutside").value  = rfidOutside;
    document.getElementById("editModal").classList.add("show");
}

function closeEditModal() {
    document.getElementById("editModal").classList.remove("show");
}

/* ── DELETE MODAL ── */
function openDeleteModal(id) {
    document.getElementById("deleteVehicleId").value = id;
    document.getElementById("deleteModal").classList.add("show");

    const btn = document.getElementById("deleteConfirmBtn");
    btn.disabled = true;
    btn.textContent = "Wait 3s...";

    let seconds = 3;
    const interval = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(interval);
            btn.disabled = false;
            btn.textContent = "Yes, Delete";
        } else {
            btn.textContent = `Wait ${seconds}s...`;
        }
    }, 1000);
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.remove("show");
}

/* Close modals on backdrop click */
window.onclick = (e) => {
    if (e.target === document.getElementById("editModal"))   closeEditModal();
    if (e.target === document.getElementById("deleteModal")) closeDeleteModal();
};

/* ── ADD VEHICLE ── */
document.getElementById("addVehicleForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const full_name    = document.getElementById("fullName").value.trim();
    const plate_number = document.getElementById("plateNumber").value.trim();
    const vehicle_type = document.getElementById("vehicleType").value.trim();
    const rfid_inside  = document.getElementById("rfidInside").value.trim();
    const rfid_outside = document.getElementById("rfidOutside").value.trim();

    if (!full_name || !plate_number || !vehicle_type || !rfid_inside || !rfid_outside) {
        showErrorModal("Empty Fields", "Please fill in all required fields before submitting.");
        return;
    }

    const { error } = await supabaseClient
        .from("vehicles")
        .insert([{ full_name, plate_number, vehicle_type, rfid_inside, rfid_outside }]);

    if (error) {
        showErrorModal("Something went wrong", error.message);
        return;
    }

    this.reset();
    showSuccessModal("Vehicle Added!", "The vehicle has been successfully added.");
    loadVehicles();
});

/* ── UPDATE VEHICLE ── */
document.getElementById("editVehicleForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const id = document.getElementById("editVehicleId").value;
    const updatedVehicle = {
        full_name:    document.getElementById("editFullName").value.trim(),
        plate_number: document.getElementById("editPlateNumber").value.trim(),
        vehicle_type: document.getElementById("editVehicleType").value.trim(),
        rfid_inside:  document.getElementById("editRfidInside").value.trim(),
        rfid_outside: document.getElementById("editRfidOutside").value.trim()
    };

    const { error } = await supabaseClient.from("vehicles").update(updatedVehicle).eq("id", id);

    if (error) {
        showErrorModal("Update Failed", error.message);
        return;
    }

    closeEditModal();
    showSuccessModal("Vehicle Updated!", "The vehicle has been successfully updated.");
    loadVehicles();
});

/* ── DELETE VEHICLE ── */
async function confirmDelete() {
    const id = document.getElementById("deleteVehicleId").value;
    const { error } = await supabaseClient.from("vehicles").delete().eq("id", id);

    if (error) {
        closeDeleteModal();
        showErrorModal("Delete Failed", error.message);
        return;
    }

    closeDeleteModal();
    showSuccessModal("Vehicle Deleted!", "The vehicle has been successfully removed.");
    loadVehicles();
}

/* ── FEEDBACK MODALS ── */
function showSuccessModal(title, message) {
    document.getElementById("successTitle").textContent   = title;
    document.getElementById("successMessage").textContent = message;
    document.getElementById("successModal").classList.add("show");
}
function closeSuccessModal() { document.getElementById("successModal").classList.remove("show"); }

function showErrorModal(title, message) {
    document.getElementById("errorTitle").textContent   = title;
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("errorModal").classList.add("show");
}
function closeErrorModal() { document.getElementById("errorModal").classList.remove("show"); }

/* ── INIT ── */
window.onload = () => {
    loadVehicles();
};
