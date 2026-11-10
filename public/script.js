const defaultTeams = [
    { name: "Red Bull", drivers: ["Eithan", "LJ"] },
    { name: "Racing Bulls", drivers: ["D4RK", "Micheal"] },
    { name: "Ferrari", drivers: ["Jello", "Hiero"] },
    { name: "McLaren", drivers: ["Kaiden", "NENE"] },
    { name: "Mercedes", drivers: ["MangoTango", "Noir"] },
    { name: "Aston Martin", drivers: ["Rodri", "Charles"] },
    { name: "Renault F1 Team", drivers: ["Void", "SF2"] },
    { name: "Haas", drivers: ["Hezzy", "Adam"] },
    { name: "Renault Sport", drivers: ["SmartestBC", "Lewis"] },
    { name: "APX GP", drivers: ["Rash", "XPAV"] }
];

const calendarRounds = [
    "Australia", "Japan", "Saudi Arabia", "Monaco", "United Kingdom", 
    "Malaysia", "Belgium", "Singapore", "USA (Austin)", "Brazil", 
    "USA (Las Vegas)", "Philippines (Manila)"
];

const f1Points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

let raceResults = {};
let fiaAdjustments = {}; 
let newsArticles = [
    { id: 1, title: "Season 1 Grid Officially Unveiled", date: "Nov 2026", content: "All 10 constructor teams and 20 drivers have completed pre-season testing and are primed for Round 1 in Australia." },
    { id: 2, title: "FIA Announces Technical Regs", date: "Nov 2026", content: "Strict adherence to aerodynamic limiters and standard tire compounds enforced for all Brookhaven GP events." }
];

function switchTab(tabId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if(btn.getAttribute('onclick')?.includes(tabId)) {
            btn.classList.add('active');
        }
    });
    window.scrollTo(0, 0);
}

function calculateDriverPoints(driverName) {
    let basePts = 0;
    for (let round in raceResults) {
        raceResults[round].forEach(res => {
            if (res.driver === driverName) basePts += res.pts || 0;
        });
    }
    let adj = fiaAdjustments[driverName] || 0;
    return basePts + adj;
}

function calculateTeamPoints(teamName) {
    let teamObj = defaultTeams.find(t => t.name === teamName);
    if (!teamObj) return 0;
    let total = 0;
    teamObj.drivers.forEach(d => {
        total += calculateDriverPoints(d);
    });
    return total;
}

function populateAdminDropdowns() {
    const adminDriverSelect = document.getElementById('adminDriverSelect');
    const fiaAdjDriverSelect = document.getElementById('fiaAdjDriverSelect');
    
    if (!adminDriverSelect || !fiaAdjDriverSelect) return;

    adminDriverSelect.innerHTML = '';
    fiaAdjDriverSelect.innerHTML = '';

    defaultTeams.forEach(team => {
        team.drivers.forEach(driver => {
            adminDriverSelect.innerHTML += `<option value="${driver}">${driver} (${team.name})</option>`;
            fiaAdjDriverSelect.innerHTML += `<option value="${driver}">${driver} (${team.name})</option>`;
        });
    });
}

function renderTeamsAndDrivers() {
    const driversGrid = document.getElementById('driversGrid');
    const teamsGrid = document.getElementById('teamsGrid');

    if (!driversGrid || !teamsGrid) return;

    driversGrid.innerHTML = '';
    teamsGrid.innerHTML = '';

    let allDrivers = [];
    defaultTeams.forEach(team => {
        team.drivers.forEach(driver => {
            allDrivers.push({ name: driver, team: team.name });
        });
    });

    // Render Teams Grid with click inspection
    defaultTeams.forEach(team => {
        let teamPts = calculateTeamPoints(team.name);
        let teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.onclick = () => showTeamModal(team.name);
        teamCard.innerHTML = `<h3>${team.name}</h3><p style="color:var(--electric-blue); font-family:'Orbitron'; font-weight:700; margin-bottom:10px;">${teamPts} PTS</p>`;
        
        team.drivers.forEach(driver => {
            let dPts = calculateDriverPoints(driver);
            teamCard.innerHTML += `<div class="driver-pill"><span>${driver}</span><span style="font-family:'Orbitron'; color:var(--electric-blue);">${dPts} PTS</span></div>`;
        });
        teamsGrid.appendChild(teamCard);
    });

    // Render Drivers Grid with click inspection
    allDrivers.sort((a,b) => a.name.localeCompare(b.name)).forEach(d => {
        let dPts = calculateDriverPoints(d.name);
        driversGrid.innerHTML += `
            <div class="team-card" onclick="showDriverModal('${d.name}', '${d.team}')">
                <h3>${d.name}</h3>
                <div class="driver-pill"><span>Constructor</span><span style="color:var(--electric-blue);">${d.team}</span></div>
                <div style="margin-top:10px; font-family:'Orbitron'; font-weight:700; color:var(--electric-blue); font-size:16px;">${dPts} PTS</div>
            </div>
        `;
    });

    populateAdminDropdowns();
}

function showDriverModal(driverName, teamName) {
    let pts = calculateDriverPoints(driverName);
    document.getElementById('modalTitle').innerText = `${driverName} (${teamName})`;
    document.getElementById('modalBody').innerHTML = `
        <div style="font-size: 28px; font-family: 'Orbitron'; font-weight: 900; color: var(--electric-blue); margin: 15px 0;">${pts} PTS</div>
        <p style="color: var(--text-muted); font-size: 13px;">Official WDC Championship Points (includes race classifications and FIA adjustments).</p>
    `;
    document.getElementById('pointsModal').style.display = 'flex';
}

function showTeamModal(teamName) {
    let pts = calculateTeamPoints(teamName);
    let teamObj = defaultTeams.find(t => t.name === teamName);
    let driversHtml = teamObj.drivers.map(d => `<div style="display:flex; justify-content:space-between; margin: 6px 0; font-size:14px;"><span>${d}</span><strong>${calculateDriverPoints(d)} PTS</strong></div>`).join('');

    document.getElementById('modalTitle').innerText = `${teamName} Constructor`;
    document.getElementById('modalBody').innerHTML = `
        <div style="font-size: 28px; font-family: 'Orbitron'; font-weight: 900; color: var(--electric-blue); margin: 10px 0;">${pts} PTS</div>
        <div style="border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 10px; text-align: left;">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; font-family:'Orbitron';">DRIVER BREAKDOWN:</div>
            ${driversHtml}
        </div>
    `;
    document.getElementById('pointsModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('pointsModal').style.display = 'none';
}

function calculateStandings() {
    let driverPts = {};
    let constructorPts = {};

    defaultTeams.forEach(t => {
        constructorPts[t.name] = 0;
        t.drivers.forEach(d => {
            let total = calculateDriverPoints(d);
            driverPts[d] = { points: total, team: t.name };
            constructorPts[t.name] += total;
        });
    });

    let sortedDrivers = Object.keys(driverPts).map(d => ({
        name: d,
        team: driverPts[d].team,
        points: driverPts[d].points
    })).sort((a, b) => b.points - a.points);

    // Render Main Driver Standings Table
    let dBody = document.getElementById('driverStandingsBody');
    if (dBody) {
        dBody.innerHTML = '';
        sortedDrivers.forEach((d, idx) => {
            dBody.innerHTML += `
                <tr>
                    <td><span class="pos-badge">${idx + 1}</span></td>
                    <td><strong>${d.name}</strong></td>
                    <td style="color: var(--text-muted);">${d.team}</td>
                    <td style="text-align: right; font-family: 'Orbitron'; font-weight: 700; color: var(--electric-blue);">${d.points}</td>
                </tr>
            `;
        });
    }

    // Render Sidebar Driver Championship Menu
    let sideDrivers = document.getElementById('sidebarDriverStandings');
    if (sideDrivers) {
        sideDrivers.innerHTML = '';
        sortedDrivers.slice(0, 10).forEach((d, idx) => {
            sideDrivers.innerHTML += `
                <div class="mini-standings-row">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-family:'Orbitron'; font-weight:700; color:var(--electric-blue);">${idx + 1}</span>
                        <span>${d.name}</span>
                    </div>
                    <strong style="font-family:'Orbitron';">${d.points} PTS</strong>
                </div>
            `;
        });
    }

    let sortedConstructors = Object.keys(constructorPts).map(c => ({
        name: c,
        drivers: defaultTeams.find(t => t.name === c).drivers.join(' & '),
        points: constructorPts[c]
    })).sort((a, b) => b.points - a.points);

    // Render Main Constructor Standings Table
    let cBody = document.getElementById('constructorStandingsBody');
    if (cBody) {
        cBody.innerHTML = '';
        sortedConstructors.forEach((c, idx) => {
            cBody.innerHTML += `
                <tr>
                    <td><span class="pos-badge">${idx + 1}</span></td>
                    <td><strong>${c.name}</strong></td>
                    <td style="color: var(--text-muted); font-size: 13px;">${c.drivers}</td>
                    <td style="text-align: right; font-family: 'Orbitron'; font-weight: 700; color: var(--electric-blue);">${c.points}</td>
                </tr>
            `;
        });
    }

    // Render Sidebar Constructor Championship Menu
    let sideConstructors = document.getElementById('sidebarConstructorStandings');
    if (sideConstructors) {
        sideConstructors.innerHTML = '';
        sortedConstructors.forEach((c, idx) => {
            sideConstructors.innerHTML += `
                <div class="mini-standings-row">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-family:'Orbitron'; font-weight:700; color:var(--electric-blue);">${idx + 1}</span>
                        <span>${c.name}</span>
                    </div>
                    <strong style="font-family:'Orbitron';">${c.points} PTS</strong>
                </div>
            `;
        });
    }

    renderTeamsAndDrivers();
}

function renderCalendar() {
    const calGrid = document.getElementById('calendarGrid');
    const roundSelect = document.getElementById('resultRoundSelect');
    const adminRoundSelect = document.getElementById('adminRoundSelect');

    if (calGrid) calGrid.innerHTML = '';
    if (roundSelect) roundSelect.innerHTML = '';
    if (adminRoundSelect) adminRoundSelect.innerHTML = '';

    calendarRounds.forEach((round, idx) => {
        let hasResults = raceResults[round] && raceResults[round].length > 0;
        let statusClass = hasResults ? 'completed' : 'upcoming';
        let statusText = hasResults ? 'Completed' : 'Upcoming';

        if (calGrid) {
            calGrid.innerHTML += `
                <div class="round-card">
                    <div>
                        <div class="round-header">
                            <span class="round-num">ROUND ${idx + 1}</span>
                            <span class="round-status ${statusClass}">${statusText}</span>
                        </div>
                        <h3 style="font-size: 16px; margin-bottom: 5px;">${round} Grand Prix</h3>
                        <p style="color: var(--text-muted); font-size: 12px;">Season 1 Official Circuit</p>
                    </div>
                </div>
            `;
        }

        if (roundSelect) roundSelect.innerHTML += `<option value="${round}">Round ${idx + 1}: ${round} Grand Prix</option>`;
        if (adminRoundSelect) adminRoundSelect.innerHTML += `<option value="${round}">Round ${idx + 1}: ${round}</option>`;
    });
    renderResults();
}

function renderResults() {
    const roundSelect = document.getElementById('resultRoundSelect');
    if (!roundSelect) return;
    const round = roundSelect.value;
    const tbody = document.getElementById('resultsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let results = raceResults[round] || [];
    if (results.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No classification posted for this round yet.</td></tr>`;
        return;
    }

    results.sort((a, b) => a.pos - b.pos).forEach(res => {
        tbody.innerHTML += `
            <tr>
                <td><span class="pos-badge">${res.pos}</span></td>
                <td><strong>${res.driver}</strong></td>
                <td style="color: var(--text-muted);">${res.team}</td>
                <td>${escapeHtml(res.status)}</td>
                <td style="text-align: right; font-family: 'Orbitron'; font-weight: 700; color: var(--electric-blue);">+${res.pts}</td>
            </tr>
        `;
    });
}

function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    newsGrid.innerHTML = '';

    newsArticles.forEach(art => {
        newsGrid.innerHTML += `
            <div class="news-card">
                <div class="news-date">${escapeHtml(art.date)}</div>
                <h3>${escapeHtml(art.title)}</h3>
                <p>${escapeHtml(art.content)}</p>
            </div>
        `;
    });
}

// REAL-TIME COUNTDOWN TO SATURDAY 8:30 AM CST (UTC-6)
function initRaceCountdown() {
    function updateCountdown() {
        const now = new Date();
        
        let target = new Date();
        target.setUTCHours(14, 30, 0, 0);
        let dayOfWeek = now.getUTCDay();
        let daysUntilSat = (6 - dayOfWeek + 7) % 7;
        if (daysUntilSat === 0 && now >= target) {
            daysUntilSat = 7;
        }
        target.setUTCDate(target.getUTCDate() + daysUntilSat);

        let diff = target - now;
        if (diff <= 0) {
            let countdownEl = document.getElementById('raceCountdown');
            if (countdownEl) countdownEl.innerText = "RACE IS LIVE NOW!";
            return;
        }

        let days = Math.floor(diff / (1000 * 60 * 60 * 24));
        let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let countdownEl = document.getElementById('raceCountdown');
        let tzEl = document.getElementById('localTzLabel');
        if (countdownEl) countdownEl.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        if (tzEl) tzEl.innerText = `Target: Saturday 8:30 AM CST (Converted to your local zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Keep the original interface connected to the shared championship API.
const launchNews = [...newsArticles];
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}
async function refreshChampionship() {
    const response = await fetch('/api/championship');
    if (!response.ok) throw new Error('Live championship data is unavailable. Please refresh to try again.');
    const data = await response.json();
    raceResults = {};
    data.results.forEach(result => {
        const team = defaultTeams.find(team => team.drivers.includes(result.driver));
        if (!team || !calendarRounds.includes(result.round)) return;
        (raceResults[result.round] ||= []).push({...result, team: team.name});
    });
    fiaAdjustments = {};
    data.adjustments.forEach(adjustment => {
        if (defaultTeams.some(team => team.drivers.includes(adjustment.driver))) {
            fiaAdjustments[adjustment.driver] = (fiaAdjustments[adjustment.driver] || 0) + adjustment.points;
        }
    });
    newsArticles = [...data.news.map(article => ({...article, date: new Date(article.createdAt).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})})), ...launchNews];
    document.getElementById('authContainer').style.display = data.authenticated ? 'none' : 'block';
    document.getElementById('adminDashboard').style.display = data.authenticated ? 'block' : 'none';
    const selectedRound = document.getElementById('resultRoundSelect').value;
    calculateStandings();
    renderCalendar();
    if (selectedRound) {
        document.getElementById('resultRoundSelect').value = selectedRound;
        renderResults();
    }
    renderNews();
}
async function publishChampionship(body) {
    const response = await fetch('/api/championship', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to save changes.');
    await refreshChampionship();
}
async function handleLogin() {
    const error = document.getElementById('authError');
    try {
        await publishChampionship({action:'login', passcode:document.getElementById('fiaPassInput').value});
        document.getElementById('fiaPassInput').value = '';
        error.style.display = 'none';
    } catch (err) {
        error.textContent = err.message;
        error.style.display = 'block';
    }
}
async function handleLogout() {
    try {
        await publishChampionship({action:'logout'});
        document.getElementById('fiaPassInput').value = '';
    } catch (err) { alert(err.message); }
}
async function saveAdminResult() {
    try {
        await publishChampionship({action:'result', round:document.getElementById('adminRoundSelect').value,
            driver:document.getElementById('adminDriverSelect').value,
            pos:Number(document.getElementById('adminPosInput').value),
            status:document.getElementById('adminStatusInput').value.trim()});
        alert('Result saved successfully!');
    } catch (err) { alert(err.message); }
}
async function applyFiaAdjustment() {
    const input = document.getElementById('fiaAdjPointsInput');
    if (!input.value.trim()) { alert('Please enter a valid points number.'); return; }
    try {
        await publishChampionship({action:'adjust', driver:document.getElementById('fiaAdjDriverSelect').value, points:Number(input.value)});
        input.value = '';
        alert('Points adjustment saved successfully!');
    } catch (err) { alert(err.message); }
}
async function publishNews() {
    try {
        await publishChampionship({action:'news', title:document.getElementById('adminNewsTitle').value,
            content:document.getElementById('adminNewsContent').value});
        document.getElementById('adminNewsTitle').value = '';
        document.getElementById('adminNewsContent').value = '';
        alert('News bulletin published successfully!');
    } catch (err) { alert(err.message); }
}
window.onload = function() {
    calculateStandings();
    renderCalendar();
    renderNews();
    initRaceCountdown();
    populateAdminDropdowns();
    refreshChampionship().catch(err => alert(err.message));
};
