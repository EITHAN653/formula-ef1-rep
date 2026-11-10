const defaultTeams = JSON.parse(localStorage.getItem('ef1_teams')) || [
    { name: "Red Bull", drivers: ["Eithan", "LJ"] }, { name: "Racing Bulls", drivers: ["D4RK", "Micheal"] },
    { name: "Ferrari", drivers: ["Jello", "Hiero"] }, { name: "McLaren", drivers: ["Kaiden", "NENE"] },
    { name: "Mercedes", drivers: ["MangoTango", "Noir"] }, { name: "Aston Martin", drivers: ["Rodri", "Charles"] },
    { name: "Renault F1 Team", drivers: ["Void", "SF2"] }, { name: "Haas", drivers: ["Hezzy", "Adam"] },
    { name: "Renault Sport", drivers: ["SmartestBC", "Lewis"] }, { name: "APX GP", drivers: ["Rash", "XPAV"] }
];
let calendarRounds = JSON.parse(localStorage.getItem('ef1_calendar')) || ["Australia", "Japan", "Saudi Arabia", "Monaco", "United Kingdom", "Malaysia", "Belgium", "Singapore", "USA (Austin)", "Brazil", "USA (Las Vegas)", "Philippines (Manila)"];
const f1Points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
let raceResults = JSON.parse(localStorage.getItem('ef1_results')) || {};
let fiaAdjustments = JSON.parse(localStorage.getItem('ef1_fia_adj')) || {};
let newsArticles = JSON.parse(localStorage.getItem('ef1_news')) || [
    { id: 1, title: "Season 1 Grid Officially Unveiled", date: "Nov 2026", content: "All 10 constructor teams and 20 drivers have completed pre-season testing and are primed for Round 1 in Australia." },
    { id: 2, title: "FIA Announces Technical Regs", date: "Nov 2026", content: "Strict adherence to aerodynamic limiters and standard tire compounds enforced for all Brookhaven GP events." }
];
function switchTab(tabId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => { if (btn.getAttribute('onclick')?.includes(tabId)) btn.classList.add('active'); });
    window.scrollTo(0, 0);
}
function calculateDriverPoints(driverName) {
    let basePts = 0;
    for (const round in raceResults) (raceResults[round] || []).forEach(res => { if (res.driver === driverName) basePts += res.pts || 0; });
    return basePts + (fiaAdjustments[driverName] || 0);
}
function calculateTeamPoints(teamName) {
    const team = defaultTeams.find(t => t.name === teamName);
    return team ? team.drivers.reduce((total, driver) => total + calculateDriverPoints(driver), 0) : 0;
}
function populateAdminDropdowns() {
    const ids = ['adminDriverSelect', 'fiaAdjDriverSelect', 'swapDriverSelect', 'swapTeamSelect', 'adminRemoveRoundSelect'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
    defaultTeams.forEach(team => {
        const swapTeam = document.getElementById('swapTeamSelect');
        if (swapTeam) swapTeam.add(new Option(team.name, team.name));
        team.drivers.forEach(driver => ['adminDriverSelect', 'fiaAdjDriverSelect', 'swapDriverSelect'].forEach(id => {
            const el = document.getElementById(id); if (el) el.add(new Option(`${driver} (${team.name})`, driver));
        }));
    });
    calendarRounds.forEach(round => { const el = document.getElementById('adminRemoveRoundSelect'); if (el) el.add(new Option(round, round)); });
}
function renderTeamsAndDrivers() {
    const driversGrid = document.getElementById('driversGrid'), teamsGrid = document.getElementById('teamsGrid');
    if (!driversGrid || !teamsGrid) return;
    driversGrid.innerHTML = ''; teamsGrid.innerHTML = '';
    const allDrivers = [];
    defaultTeams.forEach(team => {
        const points = calculateTeamPoints(team.name), card = document.createElement('div'); card.className = 'team-card'; card.onclick = () => showTeamModal(team.name);
        card.innerHTML = `<h3>${team.name}</h3><p class="team-points">${points} PTS</p>`;
        team.drivers.forEach(driver => { allDrivers.push({ name: driver, team: team.name }); card.innerHTML += `<div class="driver-pill"><span>${driver}</span><span class="driver-points">${calculateDriverPoints(driver)} PTS</span></div>`; });
        teamsGrid.appendChild(card);
    });
    allDrivers.sort((a,b) => a.name.localeCompare(b.name)).forEach(d => {
        const card = document.createElement('div'); card.className = 'team-card'; card.onclick = () => showDriverModal(d.name, d.team);
        card.innerHTML = `<h3>${d.name}</h3><div class="driver-pill"><span>Constructor</span><span class="driver-team">${d.team}</span></div><div class="driver-total">${calculateDriverPoints(d.name)} PTS</div>`;
        driversGrid.appendChild(card);
    });
    populateAdminDropdowns();
}
function showDriverModal(driver, team) {
    document.getElementById('modalTitle').innerText = `${driver} (${team})`;
    document.getElementById('modalBody').innerHTML = `<div class="modal-points">${calculateDriverPoints(driver)} PTS</div><p class="muted-small">Official WDC Championship Points (includes race classifications and FIA adjustments).</p>`;
    document.getElementById('pointsModal').style.display = 'flex';
}
function showTeamModal(teamName) {
    const team = defaultTeams.find(t => t.name === teamName); if (!team) return;
    const breakdown = team.drivers.map(d => `<div class="modal-driver-row"><span>${d}</span><strong>${calculateDriverPoints(d)} PTS</strong></div>`).join('');
    document.getElementById('modalTitle').innerText = `${teamName} Constructor`;
    document.getElementById('modalBody').innerHTML = `<div class="modal-points">${calculateTeamPoints(teamName)} PTS</div><div class="modal-breakdown"><div class="breakdown-title">DRIVER BREAKDOWN:</div>${breakdown}</div>`;
    document.getElementById('pointsModal').style.display = 'flex';
}
function closeModal() { document.getElementById('pointsModal').style.display = 'none'; }
function calculateStandings() {
    const driverPts = {}, constructorPts = {};
    defaultTeams.forEach(team => { constructorPts[team.name] = 0; team.drivers.forEach(driver => { const points = calculateDriverPoints(driver); driverPts[driver] = { points, team: team.name }; constructorPts[team.name] += points; }); });
    const renderRows = (elementId, entries) => { const target = document.getElementById(elementId); if (!target) return; target.innerHTML = ''; entries.forEach((entry, idx) => { target.innerHTML += `<div class="mini-standings-row"><div class="standing-name"><span class="standing-position">${idx + 1}</span><span>${entry.name}</span></div><strong>${entry.points} PTS</strong></div>`; }); };
    renderRows('sidebarDriverStandings', Object.entries(driverPts).map(([name, v]) => ({ name, points: v.points })).sort((a,b) => b.points-a.points).slice(0,10));
    renderRows('sidebarConstructorStandings', Object.entries(constructorPts).map(([name, points]) => ({ name, points })).sort((a,b) => b.points-a.points));
    renderTeamsAndDrivers();
}
function renderCalendar() {
    const grid = document.getElementById('calendarGrid'), roundSelect = document.getElementById('resultRoundSelect'), adminSelect = document.getElementById('adminRoundSelect');
    if (grid) grid.innerHTML = ''; if (roundSelect) roundSelect.innerHTML = ''; if (adminSelect) adminSelect.innerHTML = '';
    calendarRounds.forEach((round, idx) => {
        const completed = raceResults[round]?.length > 0;
        if (grid) grid.innerHTML += `<div class="round-card"><div><div class="round-header"><span class="round-num">ROUND ${idx + 1}</span><span class="round-status ${completed ? 'completed' : 'upcoming'}">${completed ? 'Completed' : 'Upcoming'}</span></div><h3 class="round-title">${round} Grand Prix</h3><p class="round-subtitle">Season 1 Official Circuit</p></div></div>`;
        if (roundSelect) roundSelect.add(new Option(`Round ${idx + 1}: ${round} Grand Prix`, round));
        if (adminSelect) adminSelect.add(new Option(`Round ${idx + 1}: ${round}`, round));
    });
    renderResults();
}
function renderResults() {
    const select = document.getElementById('resultRoundSelect'), tbody = document.getElementById('resultsTableBody'); if (!select || !tbody) return;
    tbody.innerHTML = ''; const results = [...(raceResults[select.value] || [])].sort((a,b) => a.pos-b.pos);
    if (!results.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-results">No classification posted for this round yet.</td></tr>'; return; }
    results.forEach(res => { tbody.innerHTML += `<tr><td><span class="pos-badge">${res.pos}</span></td><td><strong>${res.driver}</strong></td><td class="muted-cell">${res.team}</td><td>${res.status}</td><td class="result-points">+${res.pts}</td></tr>`; });
}
function renderNews() {
    const grid = document.getElementById('newsGrid'); if (!grid) return; grid.innerHTML = '';
    newsArticles.forEach(article => { grid.innerHTML += `<div class="news-card"><div class="news-date">${article.date}</div><h3>${article.title}</h3><p>${article.content}</p></div>`; });
}
function initRaceCountdown() {
    function update() {
        const now = new Date(), target = new Date(now); target.setHours(8,30,0,0);
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
        target.setDate(target.getDate() + (daysUntilSaturday === 0 && target <= now ? 7 : daysUntilSaturday));
        const diff = target - now, countdown = document.getElementById('raceCountdown'), tz = document.getElementById('localTzLabel');
        if (!countdown) return;
        if (diff <= 0) { countdown.innerText = 'RACE IS LIVE NOW!'; return; }
        const days = Math.floor(diff / 86400000), hours = Math.floor(diff % 86400000 / 3600000), minutes = Math.floor(diff % 3600000 / 60000), seconds = Math.floor(diff % 60000 / 1000);
        countdown.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        if (tz) tz.innerText = `Saturday 8:30 AM in your local time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    }
    update(); setInterval(update, 1000);
}
function handleLogin() {
    const error = document.getElementById('authError');
    error.innerText = 'Administrator access is disabled until secure server-side authentication is configured.';
    error.style.display = 'block';
}
function handleLogout() { document.getElementById('authContainer').style.display = 'block'; document.getElementById('adminDashboard').style.display = 'none'; document.getElementById('fiaPassInput').value = ''; }
function addRaceRound() {
    const input = document.getElementById('newRoundInput'), name = input.value.trim();
    if (!name) return alert('Please enter a valid Grand Prix circuit name.');
    if (calendarRounds.includes(name)) return alert('This round already exists in the calendar.');
    calendarRounds.push(name); localStorage.setItem('ef1_calendar', JSON.stringify(calendarRounds)); renderCalendar(); populateAdminDropdowns(); input.value = ''; alert(`Successfully added ${name} Grand Prix to the calendar!`);
}
function removeRaceRound() {
    const name = document.getElementById('adminRemoveRoundSelect').value;
    if (!name) return alert('Please select a round to remove.'); if (calendarRounds.length <= 1) return alert('You must have at least 1 round in the calendar.');
    calendarRounds = calendarRounds.filter(round => round !== name); delete raceResults[name];
    localStorage.setItem('ef1_calendar', JSON.stringify(calendarRounds)); localStorage.setItem('ef1_results', JSON.stringify(raceResults)); renderCalendar(); calculateStandings(); populateAdminDropdowns(); alert(`Successfully removed ${name} Grand Prix from the calendar.`);
}
function executeDriverSwap() {
    const driver = document.getElementById('swapDriverSelect').value, targetName = document.getElementById('swapTeamSelect').value;
    const current = defaultTeams.find(team => team.drivers.includes(driver)), target = defaultTeams.find(team => team.name === targetName);
    if (!current || !target) return alert('Error locating driver or team.'); if (current === target) return alert('Driver is already on this team.');
    current.drivers = current.drivers.filter(d => d !== driver);
    if (target.drivers.length >= 2) { const bumped = target.drivers.pop(); current.drivers.push(bumped); alert(`Swapped ${driver} to ${targetName}. ${bumped} was moved to ${current.name} to maintain team pairings.`); }
    else alert(`Successfully transferred ${driver} to ${targetName}!`);
    target.drivers.push(driver); localStorage.setItem('ef1_teams', JSON.stringify(defaultTeams)); calculateStandings(); populateAdminDropdowns();
}
function saveAdminResult() {
    const round = document.getElementById('adminRoundSelect').value, driver = document.getElementById('adminDriverSelect').value, pos = parseInt(document.getElementById('adminPosInput').value, 10), status = document.getElementById('adminStatusInput').value.trim();
    if (isNaN(pos) || pos < 1 || pos > 20) return alert('Please enter a valid position between 1 and 20.');
    if (!raceResults[round]) raceResults[round] = [];
    if (raceResults[round].some(result => result.pos === pos && result.driver !== driver)) return alert(`Position P${pos} is already taken in ${round}! Please choose a different position.`);
    const team = defaultTeams.find(t => t.drivers.includes(driver))?.name || 'Unknown', upper = status.toUpperCase(), pts = ['DNF','DSQ','DNS'].includes(upper) ? 0 : (pos <= 10 ? f1Points[pos-1] : 0);
    raceResults[round] = raceResults[round].filter(result => result.driver !== driver); raceResults[round].push({ pos, driver, team, status, pts });
    localStorage.setItem('ef1_results', JSON.stringify(raceResults)); calculateStandings(); renderCalendar(); alert(`Result saved successfully for ${driver} at ${round} (P${pos}, ${pts} PTS)!`);
}
function applyFiaAdjustment() {
    const driver = document.getElementById('fiaAdjDriverSelect').value, points = parseInt(document.getElementById('fiaAdjPointsInput').value, 10);
    if (isNaN(points)) return alert('Please enter a valid points number.');
    fiaAdjustments[driver] = (fiaAdjustments[driver] || 0) + points; localStorage.setItem('ef1_fia_adj', JSON.stringify(fiaAdjustments)); calculateStandings(); alert(`Successfully adjusted points for ${driver} by ${points > 0 ? '+' : ''}${points} PTS!`); document.getElementById('fiaAdjPointsInput').value = '';
}
function publishNews() {
    const title = document.getElementById('adminNewsTitle').value.trim(), content = document.getElementById('adminNewsContent').value.trim();
    if (!title || !content) return alert('Please fill out both title and content.');
    newsArticles.unshift({ id: Date.now(), title, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), content });
    localStorage.setItem('ef1_news', JSON.stringify(newsArticles)); renderNews(); document.getElementById('adminNewsTitle').value = ''; document.getElementById('adminNewsContent').value = ''; alert('News bulletin published successfully!');
}
function exportLeagueData() {
    const data = { teams: defaultTeams, calendar: calendarRounds, results: raceResults, fiaAdjustments, news: newsArticles };
    const anchor = document.createElement('a'); anchor.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)); anchor.download = `ef1_championship_backup_${Date.now()}.json`; document.body.appendChild(anchor); anchor.click(); anchor.remove();
}
function importLeagueData(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.teams) defaultTeams.splice(0, defaultTeams.length, ...data.teams);
            if (data.calendar) calendarRounds = data.calendar; if (data.results) raceResults = data.results; if (data.fiaAdjustments) fiaAdjustments = data.fiaAdjustments; if (data.news) newsArticles = data.news;
            localStorage.setItem('ef1_teams', JSON.stringify(defaultTeams)); localStorage.setItem('ef1_calendar', JSON.stringify(calendarRounds)); localStorage.setItem('ef1_results', JSON.stringify(raceResults)); localStorage.setItem('ef1_fia_adj', JSON.stringify(fiaAdjustments)); localStorage.setItem('ef1_news', JSON.stringify(newsArticles));
            calculateStandings(); renderCalendar(); renderNews(); alert('Successfully imported league backup data!');
        } catch { alert('Invalid JSON backup file.'); }
    }; reader.readAsText(file);
}
window.onload = () => { calculateStandings(); renderCalendar(); renderNews(); initRaceCountdown(); populateAdminDropdowns(); };
