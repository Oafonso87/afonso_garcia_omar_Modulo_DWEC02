import GastoCombustible from './gastoCombustible.js';
// ------------------------------ 1. VARIABLES GLOBALES ------------------------------
let tarifasJSON = null;
let gastosJSON = null;
let tarifasJSONpath = '../json/tarifasCombustible.json';
let gastosJSONpath = '../json/gastosCombustible.json';
let aniosArray = [];

// ------------------------------ 2. CARGA INICIAL DE DATOS (NO TOCAR!) ------------------------------
// Esto inicializa los eventos del formulario y carga los datos iniciales
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar los JSON cuando la página se carga, antes de cualquier interacción del usuario
    await cargarDatosIniciales();

    // mostrar datos en consola
    console.log('Tarifas JSON: ', tarifasJSON);
    console.log('Gastos JSON: ', gastosJSON);

    calcularGastoTotal();

    // Inicializar eventos el formularios
    document.getElementById('fuel-form').addEventListener('submit', guardarGasto);
});

// Función para cargar ambos ficheros JSON al cargar la página
async function cargarDatosIniciales() {

    try {
        // Esperar a que ambos ficheros se carguen
        tarifasJSON = await cargarJSON(tarifasJSONpath);
        gastosJSON = await cargarJSON(gastosJSONpath);

    } catch (error) {
        console.error('Error al cargar los ficheros JSON:', error);
    }
}

// Función para cargar un JSON desde una ruta específica
async function cargarJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Error al cargar el archivo JSON: ${path}`);
    }
    return await response.json();
}

// ------------------------------ 3. FUNCIONES ------------------------------
// Calcular gasto total por año al iniciar la aplicación
function calcularGastoTotal() {
    
    aniosArray = {
        2010: 0,
        2011: 0,
        2012: 0,
        2013: 0,
        2014: 0,
        2015: 0,
        2016: 0,
        2017: 0,
        2018: 0,
        2019: 0,
        2020: 0
    }
    
    gastosJSON.forEach(gasto => {
        let fecha = new Date(gasto.date);
        let anio = fecha.getFullYear();
        if (anio >= 2010 && anio <= 2020) {
            aniosArray[anio] += gasto.precioViaje;
        }
    });

    // Actualizar el contenido en el HTML con los gastos por año
    for (let anio in aniosArray) {
        document.getElementById(`gasto${anio}`).textContent = aniosArray[anio].toFixed(2);
    }
}

function actualizarGastoTotal(anio, precioViaje) {
    if (anio >= 2010 && anio <= 2020) {
        // Sumar el nuevo gasto al total del año correspondiente
        aniosArray[anio] += precioViaje;

        // Actualizar el contenido en el HTML con el nuevo gasto
        document.getElementById(`gasto${anio}`).textContent = aniosArray[anio].toFixed(2);
    }
}

// guardar gasto introducido y actualizar datos
function guardarGasto(event) {
    event.preventDefault(); 

    // Obtener los datos del formulario
    const tipoVehiculo = document.getElementById('vehicle-type').value;
    const fecha = new Date(document.getElementById('date').value);
    const kilometros = parseFloat(document.getElementById('kilometers').value);
    

    // Recorrer el JSON de tarifasCombustible para buscar la tarifa correcta
    const anio = fecha.getFullYear();
    let tarifaKm = 0;

    tarifasJSON.tarifas.forEach(tarifa => {
        if (tarifa.anio === anio) {
            tarifaKm = tarifa.vehiculos[tipoVehiculo];
        }
    });

    // Calcular el precio del viaje
    const precioViaje = kilometros * tarifaKm;

    // Crear un nuevo objeto de tipo GastoCombustible
    const nuevoGasto = new GastoCombustible(tipoVehiculo, fecha, kilometros, precioViaje);
    const nuevoGastoJSON = nuevoGasto.convertToJSON();    
    
    // Incluir el nuevo gasto en formato JSON en la lista del HTML
    document.getElementById("expense-list").innerHTML += `<li>${nuevoGastoJSON}</li>`;    

    // Llama a calcularGastoTotal para actualizar los totales en la vista
    actualizarGastoTotal(anio, precioViaje);    
    
    // Resetear el formulario
    document.getElementById('fuel-form').reset();
}