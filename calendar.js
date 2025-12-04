const apiKey = 'patQ4fEuvjEX05PHx.cf31ed791fbac42e2e35d96c0f6551f932b4419eceeb506e7faf20b6f5863b98';
const baseId = 'appajBYutiTd1acc9';
const tableName = 'Calendario';

// FETCH usando la vista "Grid view"
function fetchCalendarData() {
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
    .then(json => {
        console.log(json);
        if (json.error) {
            document.getElementById('calendar-container').innerText =
                "Errore: " + json.error.message;
            return;
        }
        renderCalendar(json.records);
    })
    .catch(error => {
        console.error(error);
        document.getElementById('calendar-container').innerText =
            "Errore nel caricamento del calendario.";
    });
}

// RENDER: ogni 4 record consecutivi = 1 giornata
function renderCalendar(records) {
    const container = document.getElementById('calendar-container');
    container.innerHTML = "";

    const matchesPerDay = 4;
    const totalDays = Math.ceil(records.length / matchesPerDay);

    for (let day = 0; day < totalDays; day++) {
        const start = day * matchesPerDay;
        const end = start + matchesPerDay;
        const partite = records.slice(start, end);

        const block = document.createElement('div');
        block.className = "giornata-block";

        block.innerHTML = `
            <h2 class="giornata-titolo">GIORNATA ${day + 1}</h2>
            <table class="calendario-table">
                <thead>
                    <tr>
                        <th>In Casa</th>
                        <th>Fuori Casa</th>
                        <th>Data</th>
                        <th>Giorno</th>
                        <th>Ora</th>
                    </tr>
                </thead>
                <tbody>
                    ${partite.map(p => `
                        <tr>
                            <td>${p.fields["IN CASA"] || ""}</td>
                            <td>${p.fields["FUORI CASA"] || ""}</td>
                            <td>${p.fields["Data"] || ""}</td>
                            <td>${p.fields["Giorno"] || ""}</td>
                            <td>${p.fields["Ora"] || ""}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.appendChild(block);
    }
}

// Avvio
fetchCalendarData();
