// calendar.js – usa funzione Netlify, nessun token lato client

// FETCH usando la vista "Grid view" tramite funzione Netlify
function fetchCalendarData() {
    fetch('/.netlify/functions/airtable-results')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(json => {
            console.log('Calendario (funzione Netlify):', json);
            if (json.error) {
                document.getElementById('calendar-container').innerText =
                    'Errore: ' + json.error;
                return;
            }
            renderCalendar(json.records);
        })
        .catch(error => {
            console.error('Errore fetch calendario:', error);
            document.getElementById('calendar-container').innerText =
                'Errore nel caricamento del calendario.';
        });
}


// RENDER: ogni 4 record consecutivi = 1 giornata
function renderCalendar(records) {
    const container = document.getElementById('calendar-container');
    container.innerHTML = '';

    const matchesPerDay = 4;
    const totalDays = Math.ceil(records.length / matchesPerDay);

    for (let day = 0; day < totalDays; day++) {
        const start = day * matchesPerDay;
        const end = start + matchesPerDay;
        const partite = records.slice(start, end);

        const block = document.createElement('div');
        block.className = 'giornata-block';

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
                            <td>${p.fields['IN CASA'] || ''}</td>
                            <td>${p.fields['FUORI CASA'] || ''}</td>
                            <td>${p.fields['Data'] || ''}</td>
                            <td>${p.fields['Giorno'] || ''}</td>
                            <td>${p.fields['Ora'] || ''}</td>
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
