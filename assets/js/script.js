// Arreglo global para almacenar las reservas de entradas 
let reservas = JSON.parse(localStorage.getItem('cine_reservas')) || [];

/**
 * Parte 2: obtenerDatos()
 * Obtiene la información directamente desde los inputs del formulario[cite: 37, 38].
 */
function obtenerDatos() {
    return {
        cliente: document.getElementById('client-name').value,
        pelicula: document.getElementById('movie-title').value,
        entradas: document.getElementById('ticket-quantity').value
    };
}

/* validarDatos() */
function validarDatos(datos) {

    const clienteLimpio = datos.cliente.trim();
    const peliculaLimpia = datos.pelicula.trim();
    
    const alertBox = document.getElementById('validation-alert');
    alertBox.textContent = ''; // Limpiar mensajes previos 
    alertBox.classList.add('hidden'); // Ocultar por defecto 

    // Validar que ningún campo esté vacío
    if (clienteLimpio === "" || peliculaLimpia === "" || datos.entradas === "") {
        alertBox.textContent = "Error: Todos los campos del formulario son obligatorios."; 
        alertBox.classList.remove('hidden');
        return false;
    }

    // Convertir cantidad a entero para evaluar propiedades numéricas
    const cantidadEntradas = parseInt(datos.entradas, 10);

    // Validar formato no numérico o valores menores o iguales a cero [cite: 75, 76]
    if (isNaN(cantidadEntradas) || cantidadEntradas <= 0) {
        alertBox.textContent = "Error: La cantidad de entradas debe ser un número entero mayor a cero.";
        alertBox.classList.remove('hidden'); 
        return false;
    }

    return true; // Validación superada con éxito
}

/* Suma las entradas e identifica la película más popular de forma dinámica */
function calcularTotalEntradas() {
    const summaryContainer = document.getElementById('summary-container');
    if (!summaryContainer) return;

    // Calcular el acumulado de entradas asistidas empleando reduce
    const totalEntradas = reservas.reduce((suma, r) => suma + r.entradas, 0);

    // Desafío adicional: Determinar la película más solicitada 
    let peliculaTop = "Ninguna";
    if (reservas.length > 0) {
        const conteoPeliculas = {};
        reservas.forEach(r => {
            const titulo = r.pelicula.trim();
            conteoPeliculas[titulo] = (conteoPeliculas[titulo] || 0) + r.entradas;
        });
        
        let maxEntradas = 0;
        for (const pelicula in conteoPeliculas) {
            if (conteoPeliculas[pelicula] > maxEntradas) {
                maxEntradas = conteoPeliculas[pelicula];
                peliculaTop = pelicula;
            }
        }
    }

    // Inyeccion del bloque de analíticas del cine al DOM
    summaryContainer.innerHTML = `
        <h2 class="section-title">Indicadores del Cine</h2>
        <div class="summary-grid">
            <div class="metric-card">
                <span class="metric-title">Total de Reservas</span>
                <span class="metric-number">${reservas.length}</span>
            </div>
            <div class="metric-card">
                <span class="metric-title">Total Entradas Reservadas</span>
                <span class="metric-number text-highlight">${totalEntradas}</span>
            </div>
            <div class="metric-card">
                <span class="metric-title">Película más Taquillera</span>
                <span class="metric-number" style="font-size: 1.2rem; margin-top: 0.5rem; color: var(--color-success); display: block; font-weight: 700;">
                    ${peliculaTop}
                </span>
            </div>
        </div>
    `;
}

/* Recorre el arreglo y fabrica dinámicamente las tarjetas mediante el DOM */
function mostrarReservas() {
    const container = document.getElementById('reservations-list');
    if (!container) return;
    container.innerHTML = ''; // Vaciar listado [cite: 67]

    reservas.forEach((reserva, index) => {
        // Crear elementos con métodos explícitos exigidos en Parte 3 [cite: 64]
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card-juego');

        const h3Cliente = document.createElement('h3');
        h3Cliente.textContent = reserva.cliente; 

        const pPelicula = document.createElement('p'); 
        pPelicula.classList.add('movie-title-text'); 
        pPelicula.textContent = `Película: ${reserva.pelicula}`;

        const pEntradas = document.createElement('p'); 
        pEntradas.classList.add('tickets-count');
        pEntradas.innerHTML = `Tickets: <span>${reserva.entradas} un.</span>`; 

        // Botón Eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn-delete'); 
        btnEliminar.textContent = "Eliminar Reserva";
        
        // Asignación de evento de eliminación pasando el índice de forma segura
        btnEliminar.addEventListener('click', () => {
            eliminarReserva(index, cardDiv);
        });

        // tarjeta usando appendChild
        cardDiv.appendChild(h3Cliente); 
        cardDiv.appendChild(pPelicula); 
        cardDiv.appendChild(pEntradas); 
        cardDiv.appendChild(btnEliminar); 

        container.appendChild(cardDiv); 
    });
}

/* Remueve el elemento del arreglo, limpia el nodo del DOM y recalcula las métricas */
function eliminarReserva(index, elementoDOM) {
    // Remover del arreglo global
    reservas.splice(index, 1);
    
    // Guardar estado actualizado en LocalStorage
    localStorage.setItem('cine_reservas', JSON.stringify(reservas));

    // Remover del DOM físicamente usando el método nativo indicado
    elementoDOM.remove(); 

    // Sincronizar listados y cálculos globales sin recargar la página
    mostrarReservas();
    calcularTotalEntradas();
}

/* Restablece los controles de entrada del formulario */
function limpiarFormulario() {
    document.getElementById('reservation-form').reset();
}

/* Orquestador principal de la inserción coordinada de reservas */
function registrarReserva(e) {
    e.preventDefault(); // Detener el submit nativo del navegador

    const datosInput = obtenerDatos(); //Obtener dts

    if (validarDatos(datosInput)) { //Validar dts
        // Fabricar el objeto normalizado con sus conversiones numéricas
        const nuevaReserva = {
            cliente: datosInput.cliente.trim(),
            pelicula: datosInput.pelicula.trim(),
            entradas: parseInt(datosInput.entradas, 10)
        };

        //Agregar al arreglo
        reservas.push(nuevaReserva);

        // Guardar persistencia
        localStorage.setItem('cine_reservas', JSON.stringify(reservas));

        //Actualizar componentes y limpiar
        mostrarReservas();
        calcularTotalEntradas();
        limpiarFormulario();
    }
}

// Inicialización de Eventos Seguros
document.addEventListener('DOMContentLoaded', () => {

// Botón para el desafío adicional: Eliminar todo de un viaje
    const btnClearAll = document.getElementById('btn-clear-all');
    if (btnClearAll) {
      btnClearAll.addEventListener('click', () => {
          if (confirm('¿Seguro que deseas eliminar absolutamente todas las reservas?')) {
             reservas = []; // Vaciar el arreglo
                localStorage.removeItem('cine_reservas'); // Limpiar almacenamiento local
                mostrarReservas(); // Actualizar vista vacía
                calcularTotalEntradas(); // Resetear métricas a 0
        }
    });
}
    // Pintar elementos e indicadores recuperados desde LocalStorage al arrancar
    mostrarReservas();
    calcularTotalEntradas();

    const formulario = document.getElementById('reservation-form');
    if (formulario) {
        formulario.addEventListener('submit', registrarReserva);
    }
});