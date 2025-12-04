const apiKey = 'patQ4fEuvjEX05PHx.cf31ed791fbac42e2e35d96c0f6551f932b4419eceeb506e7faf20b6f5863b98';
const baseId = 'appajBYutiTd1acc9';
const tableName = 'Calendario';


// Fetch da stessa vista "Grid view" usata per calendario/risultati
function fetchClassificaData() {
    const viewName = 'Grid view';

    fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?view=${encodeURIComponent(viewName)}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("Dati ricevuti da Airtable:", data);
        if (data.error) {
            const tbody = document.querySelector('#classifica tbody');
            tbody.innerHTML = `<tr><td colspan="3">Errore: ${data.error.message}</td></tr>`;
            return;
        }
        populateClassificaTable(data.records);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        const tbody = document.querySelector('#classifica tbody');
        tbody.innerHTML = '<tr><td colspan="3">Errore nel caricamento della classifica.</td></tr>';
    });
}
// Aggrega punti classifica per squadra (3-0/3-1 = 3 punti; 3-2 = 2-1) e popola la tabella
function populateClassificaTable(records) {
    const tbody = document.querySelector('#classifica tbody');
    tbody.innerHTML = '';

    // mappa: nome squadra -> { name, points }
    const teamPointsMap = {};

    function ensureTeam(name) {
        if (!name) return;
        if (!teamPointsMap[name]) {
            teamPointsMap[name] = { name: name, points: 0 };
        }
    }

    records.forEach(record => {
        const fields = record.fields;
        const homeTeam = fields['IN CASA'];
        const awayTeam = fields['FUORI CASA'];

        // leggo e converto in numero; se vuoto -> 0
        const rawHome = fields['CASA'];
        const rawAway = fields['FUORI'];
        const homeSets = rawHome != null ? parseInt(rawHome, 10) : 0;
        const awaySets = rawAway != null ? parseInt(rawAway, 10) : 0;

        // se non c'è nessun set assegnato, salto la riga (partita non giocata)
        if (homeSets === 0 && awaySets === 0) {
            return;
        }

        // assicura che le squadre esistano nella mappa
        ensureTeam(homeTeam);
        ensureTeam(awayTeam);

        let homePoints = 0;
        let awayPoints = 0;

        // 3-2 o 2-3 => vincente 2 punti, perdente 1 punto
        if (homeSets === 3 && awaySets === 2) {
            homePoints = 2;
            awayPoints = 1;
        } else if (awaySets === 3 && homeSets === 2) {
            awayPoints = 2;
            homePoints = 1;
        }
        // 3-0 / 3-1 o 0-3 / 1-3 => vincente 3 punti, perdente 0
        else if (homeSets === 3 && (awaySets === 0 || awaySets === 1)) {
            homePoints = 3;
        } else if (awaySets === 3 && (homeSets === 0 || homeSets === 1)) {
            awayPoints = 3;
        }
        // tutti gli altri casi: 0 punti a entrambe

        if (homeTeam) {
            teamPointsMap[homeTeam].points += homePoints;
        }
        if (awayTeam) {
            teamPointsMap[awayTeam].points += awayPoints;
        }
    });

    // ordina per punti decrescenti
    const sortedTeams = Object.values(teamPointsMap)
        .sort((a, b) => b.points - a.points);

    // popola la tabella
    sortedTeams.forEach((team, index) => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = index + 1;   // posizione
        row.insertCell(1).innerText = team.name;   // nome squadra
        row.insertCell(2).innerText = team.points; // punti classifica
    });
}


// Avvio
fetchClassificaData();
