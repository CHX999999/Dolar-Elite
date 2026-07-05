const configs = [
    { id: 'oficial', keys: ['Oficial'], l: 'Banco Nación' },
    { id: 'blue', keys: ['Blue'], l: 'Mercado Informal' },
    { id: 'tarjeta', keys: ['Tarjeta'], l: 'Impuestos' },
    { id: 'mep', keys: ['Bolsa', 'MEP'], l: 'Bolsa' },
    { id: 'ccl', keys: ['Contado con liquidación', 'CCL'], l: 'Liqui' },
    { id: 'cripto', keys: ['Cripto', 'Bitcoin'], l: 'Stablecoin' }
];

const container = document.querySelector('.main-container');
let charts = {}, lastPrices = {}, priceHistory = {}, historial = [];

// Cargar preferencia de tema guardada
if(localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');

configs.forEach(m => {
    priceHistory[m.id] = Array(10).fill(0); 
    container.innerHTML += `
    <article class="card" id="card-${m.id}">
        <div class="card-top"><h2>${m.id.toUpperCase()}</h2><span class="label-tag">${m.l}</span></div>
        <div class="info-block"><div class="small-label">Compra</div><div class="price-val" id="${m.id}-compra">---</div></div>
        <div class="info-block main">
            <p class="main-price" id="${m.id}-venta">---</p>
            <span class="spread-tag" id="${m.id}-spread">DIFERENCIA: ---</span>
            <span class="converted-val" id="${m.id}-converted" style="font-weight:700; display:block; margin-top:5px; font-size:1.1rem;"></span>
        </div>
        <div class="chart-container" id="chart-${m.id}"></div>
    </article>`;
    
    charts[m.id] = new ApexCharts(document.querySelector(`#chart-${m.id}`), {
        series: [{ data: priceHistory[m.id] }],
        chart: { type: 'line', sparkline: { enabled: true }, height: 30 },
        stroke: { curve: 'smooth', width: 3, colors: ['#38BDF8'] }
    });
    charts[m.id].render();
});

// Cambiar tema y guardar
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
};

const copiar = (text) => { navigator.clipboard.writeText(text); alert('Copiado: ' + text); };

window.validarYConvertir = () => {
    const input = document.getElementById('monto-usuario');
    const monto = parseFloat(input.value);
    
    configs.forEach(m => {
        const display = document.getElementById(`${m.id}-converted`);
        if (!isNaN(monto) && monto > 0 && lastPrices[m.id]) {
            const res = (monto / lastPrices[m.id]).toFixed(2);
            display.innerHTML = `RECIBÍS: ${res} USD <button onclick="copiar('${res}')" style="cursor:pointer; border:none; background:none;">📋</button>`;
            
            if(historial[0] !== `${m.id.toUpperCase()}: ${res}`) {
                historial.unshift(`${m.id.toUpperCase()}: ${res}`);
                if(historial.length > 3) historial.pop();
                document.getElementById('historial-conversiones').innerText = "Historial: " + historial.join(' | ');
            }
        } else { display.innerHTML = ''; }
    });
};

async function update() {
    try {
        const res = await fetch('https://dolarapi.com/v1/dolares');
        const data = await res.json();
        data.forEach(i => {
            const c = configs.find(x => x.keys.includes(i.nombre));
            if(c && i.venta) {
                const ant = lastPrices[c.id] || i.venta;
                const varPct = ((i.venta - ant) / ant * 100).toFixed(2);
                lastPrices[c.id] = i.venta;
                document.getElementById(`${c.id}-compra`).innerText = i.compra ? i.compra.toFixed(2) : '---';
                document.getElementById(`${c.id}-venta`).innerText = i.venta.toFixed(2);
                document.getElementById(`${c.id}-spread`).innerHTML = `DIFERENCIA: ${i.compra ? (i.venta-i.compra).toFixed(2) : '--'} <span style="color:${varPct >= 0 ? '#10B981':'#EF4444'}">(${varPct}%)</span>`;
                
                priceHistory[c.id].push(i.venta);
                priceHistory[c.id].shift();
                charts[c.id].updateSeries([{ data: priceHistory[c.id] }]);
            }
        });
        document.getElementById('last-update').innerText = `Actualizado: ${new Date().toLocaleTimeString()}`;
        validarYConvertir();
    } catch(e) { console.error("Error al actualizar"); }
}

setInterval(update, 10000);
update();