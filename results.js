const apiKey = 'patQ4fEuvjEX05PHx.cf31ed791fbac42e2e35d96c0f6551f932b4419eceeb506e7faf20b6f5863b98';
const baseId = 'appajBYutiTd1acc9';
const tableName = 'Calendario';


// 1. Fetch risultati dalla vista "Grid view"
function fetchResultsData() {
    const viewName = 'Grid view';
    const url = 'https://api.airtable.com/v0/' + baseId + '/' + tableName +
                '?view=' + encodeURIComponent(viewName);

    fetch(url, {
        headers: {
            Authorization: 'Bearer ' + apiKey
        }
    })
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(function (json) {
        console.log('Risultati Airtable:', json);
        if (json.error) {
            document.getElementById('results-container').innerText =
                'Errore: ' + json.error.message;
            return;
        }
        renderResults(json.records);
    })
    .catch(function (error) {
        console.error('Errore fetch risultati:', error);
        document.getElementById('results-container').innerText =
            'Errore nel caricamento dei risultati.';
    });
}


// 2. Render risultati (4 partite = 1 giornata)
function renderResults(records) {
    var container = document.getElementById('results-container');
    container.innerHTML = '';

    var matchesPerDay = 4;
    var totalDays = Math.ceil(records.length / matchesPerDay);

    // helper per formattare i set: se entrambi vuoti -> "-", altrimenti "x - y"
    function formatSet(inVal, outVal) {
        var hasValue = (inVal !== undefined && inVal !== null) ||
                       (outVal !== undefined && outVal !== null);
        if (!hasValue) return '-';
        return (inVal || 0) + ' - ' + (outVal || 0);
    }

    for (var day = 0; day < totalDays; day++) {
        var start = day * matchesPerDay;
        var end = start + matchesPerDay;
        var partite = records.slice(start, end);

        var block = document.createElement('div');
        block.className = 'giornata-block';

        var rowsHtml = '';

        partite.forEach(function (p) {
            var f = p.fields;

            // risultato complessivo: se entrambi vuoti -> "-", altrimenti "x - y"
            var risultatoCasa = f['CASA'];
            var risultatoFuori = f['FUORI'];
            var hasRisultato = (risultatoCasa !== undefined && risultatoCasa !== null) ||
                               (risultatoFuori !== undefined && risultatoFuori !== null);
            var risultatoText = hasRisultato
                ? ((risultatoCasa || 0) + ' - ' + (risultatoFuori || 0))
                : '-';

            // set 1–5
            var primoText   = formatSet(f['1 SET IN'], f['1 SET OUT']);
            var secondoText = formatSet(f['2 SET IN'], f['2 SET OUT']);
            var terzoText   = formatSet(f['3 SET IN'], f['3 SET OUT']);
            var quartoText  = formatSet(f['4 SET IN'], f['4 SET OUT']);
            var quintoText  = formatSet(f['5 SET IN'], f['5 SET OUT']);

            rowsHtml +=
                '<tr>' +
                    '<td>' + (f['IN CASA'] || '') + '</td>' +
                    '<td>' + (f['FUORI CASA'] || '') + '</td>' +
                    '<td>' + risultatoText + '</td>' +
                    '<td>' + primoText   + '</td>' +
                    '<td>' + secondoText + '</td>' +
                    '<td>' + terzoText   + '</td>' +
                    '<td>' + quartoText  + '</td>' +
                    '<td>' + quintoText  + '</td>' +
                '</tr>';
        });
        block.innerHTML =
            '<h2 class="giornata-titolo">GIORNATA ' + (day + 1) + '</h2>' +
            '<table class="calendario-table">' +
                '<thead>' +
                    '<tr>' +
                        '<th>Squadra in casa</th>' +
                        '<th>Squadra fuori casa</th>' +
                        '<th>Risultato</th>' +
                        '<th>1&deg;</th>' +
                        '<th>2&deg;</th>' +
                        '<th>3&deg;</th>' +
                        '<th>4&deg;</th>' +
                        '<th>5&deg;</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' + rowsHtml + '</tbody>' +
            '</table>';

        container.appendChild(block);
    }
}


// 3. Avvio
fetchResultsData();
