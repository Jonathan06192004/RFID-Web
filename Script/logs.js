async function logEntry(rfid) {
    try {
        const response = await fetch("http://127.0.0.1:8000/scan-rfid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rfid_uid: rfid
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.detail || "Error processing RFID");
            return;
        }

        console.log("Success:", result);

        alert(`Vehicle ${result.plate_number} is now ${result.new_status}`);

    } catch (error) {
        console.error(error);
        alert("Server error");
    }
}