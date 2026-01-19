const API_BASE = window.location.origin;

// Set default times
window.onload = () => {
    updateClock();
    setInterval(updateClock, 1000);

    // Default time range: Last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    document.getElementById('endTime').value = now.toISOString().slice(0, 16);
    document.getElementById('startTime').value = yesterday.toISOString().slice(0, 16);

    // Initial fetch
    fetchStats();
    fetchTopDefects();
};

function updateClock() {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}

async function simulateBatch() {
    const btn = document.getElementById('btn-simulate');
    const status = document.getElementById('sim-status');
    btn.disabled = true;
    status.innerText = "Generating...";

    const batch = [];
    const machines = ["M-001", "M-002", "M-003", "M-004", "M-005"];
    const lines = ["L-A", "L-B", "L-C"];

    for (let i = 0; i < 100; i++) {
        const now = new Date();
        // Random time within last hour
        const eventTime = new Date(now.getTime() - Math.random() * 3600000);

        batch.push({
            eventId: `SIM-${Date.now()}-${i}`,
            eventTime: eventTime.toISOString(),
            machineId: machines[Math.floor(Math.random() * machines.length)],
            lineId: lines[Math.floor(Math.random() * lines.length)],
            durationMs: Math.floor(Math.random() * 5000) + 100, // 100ms to 5100ms
            defectCount: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0 // 20% chance of defects
        });
    }

    status.innerText = "Sending...";

    try {
        const res = await fetch(`${API_BASE}/events/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch)
        });
        const data = await res.json();
        status.innerText = `Done! Accepted: ${data.accepted}, Deduped: ${data.deduped}`;

        // Auto refresh stats
        setTimeout(() => {
            fetchStats();
            fetchTopDefects();
        }, 1000);

    } catch (e) {
        status.innerText = "Error: " + e.message;
    } finally {
        btn.disabled = false;
    }
}

async function fetchStats() {
    const machineId = document.getElementById('machineId').value;
    const start = new Date(document.getElementById('startTime').value).toISOString();
    const end = new Date(document.getElementById('endTime').value).toISOString();

    try {
        const res = await fetch(`${API_BASE}/stats?machineId=${machineId}&start=${start}&end=${end}`);
        if (!res.ok) throw new Error("Not found or Error");
        const data = await res.json();

        document.getElementById('stats-display').classList.remove('hidden');
        document.getElementById('stat-status').innerText = data.status;
        document.getElementById('stat-status').style.color = data.status === "Healthy" ? "var(--success)" : "var(--danger)";
        document.getElementById('stat-events').innerText = data.eventsCount;
        document.getElementById('stat-defects').innerText = data.defectsCount;
        document.getElementById('stat-rate').innerText = data.avgDefectRate.toFixed(2);

    } catch (e) {
        console.error(e);
        // alert("Could not fetch stats");
    }
}

async function fetchTopDefects() {
    const hours = document.getElementById('lookback').value;
    const to = new Date();
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);

    try {
        const res = await fetch(`${API_BASE}/stats/top-defect-lines?from=${from.toISOString()}&to=${to.toISOString()}&limit=5`);
        const data = await res.json();

        const list = document.getElementById('defect-list');
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = "<li>No data found</li>";
            return;
        }

        data.forEach(line => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${line.lineId}</span>
                <span>
                    <span class="defect-count">${line.totalDefects} defects</span>
                    <small>(${line.eventCount} events)</small>
                </span>
            `;
            list.appendChild(li);
        });

    } catch (e) {
        console.error(e);
    }
}
