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

// Aplicar tema guardado
if(localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');

// Inicialización de tarjetas
configs.forEach(m => {
    priceHistory[m.id] = Array(10).fill(0); 
    container.innerHTML += `
    <article class="card" id="card-${m.id}">
        <div class="card-top">
            <h2>${m.id.toUpperCase()}</h2>
            <span class="label-tag">${m.l}</span>
        </div>
        <div class="info-group">
            <div class="small-label">Compra</div>
            <div class="price-val" id="${m.id}-compra">---</div>
        </div>
        <div class="info-group">
            <div class="main-price" id="${m.id}-venta">---</div>
            <span class="spread-tag" id="${m.id}-spread">DIFERENCIA: ---</span>
            <div class="converted-val" id="${m.id}-converted" style="font-weight:700; margin-top:5px; font-size:1.1rem; color:#38BDF8;"></div>
        </div>
    </article>`;
});

// Lógica de conversión (Afecta a todos los cuadros, sin botón)
window.validarYConvertir = () => {
    const input = document.getElementById('monto-usuario');
    const monto = parseFloat(input.value);
    
    configs.forEach(m => {
        const display = document.getElementById(`${m.id}-converted`);
        if (!isNaN(monto) && monto > 0 && lastPrices[m.id]) {
            const res = (monto / lastPrices[m.id]).toFixed(2);
            // Texto limpio sin botón
            display.innerHTML = `RECIBÍS: ${res} USD`;
        } else { 
            display.innerHTML = ''; 
        }
    });
};

// Actualización de datos
async function update() {
    try {
        const res = await fetch('https://dolarapi.com/v1/dolares');
        const data = await res.json();
        
        data.forEach(i => {
            const c = configs.find(x => x.keys.includes(i.nombre));
            if(c && i.venta) {
                lastPrices[c.id] = i.venta;
                document.getElementById(`${c.id}-compra`).innerText = i.compra ? i.compra.toFixed(2) : '---';
                document.getElementById(`${c.id}-venta`).innerText = i.venta.toFixed(2);
                document.getElementById(`${c.id}-spread`).innerHTML = `DIFERENCIA: ${i.compra ? (i.venta-i.compra).toFixed(2) : '--'}`;
            }
        });
        document.getElementById('last-update').innerText = `Actualizado: ${new Date().toLocaleTimeString()}`;
        validarYConvertir(); // Recalcula al actualizar precios
    } catch(e) { 
        console.error("Error al actualizar precios"); 
    }
}

// Eventos
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
};

setInterval(update, 10000);
update();