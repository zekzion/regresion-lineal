// variable que guardara la instancia de la grafica
let grafica;

// capturar el boton para asignarle el evento
const buttonProcesar = document.getElementById("btn-procesar");

// funcion para generar el body de la tabla de datos para las variables X e Y
buttonProcesar.addEventListener("click", function () {
    // obtener los datos X e Y quitando espacios y comas
    let arrayX = document.getElementById("datosX").value.replace(/\s/g, '').split(",");
    let arrayY = document.getElementById("datosY").value.replace(/\s/g, '').split(",");

    // convertir grupo de datos a numeros float
    arrayX = dataANum(arrayX);
    arrayY = dataANum(arrayY);

    // validar que sean numeros
    if (!validar(arrayX) || !validar(arrayY)) {
        alert("Los datos deben ser numeros!");
        return;
    }

    // si la longitud de los array no son iguales, terminar la ejecucion
    if (arrayX.length !== arrayY.length) {
        alert("La cantidad de datos de X e Y deben ser iguales!!");
        return;
    }

    // obtener el elemento donde se creara el grafico
    let lienzo = document.getElementById("grafico").getContext("2d");

    // eliminar grafica anterior al ingresar nuevos datos
    if (typeof grafica !== "undefined") {
        grafica.destroy();
    }

    // creacion de la grafica de dispersion con chart.js
    grafica = new Chart(lienzo, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Datos de dispersión",
                data: arrayX.map((x, i) => ({x: x, y: arrayY[i]})),
                backgroundColor: "blue",
                borderColor: "blue",
                pointRadius: 5,
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    display: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Datos X"
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Datos Y"
                    }
                }
            }
        }
    });

    // obtener el elmento tabla
    let bodyTable = document.getElementById("resultados");
    bodyTable.innerHTML = "";

    // loop que genera nuevas filas con los valores calculados
    for (let i = 0; i < arrayX.length; i++) {
        let fila = document.createElement("tr");

        // calcular valores
        let x = arrayX[i];
        let y = arrayY[i];
        let yCuadrado = parseFloat((y ** 2).toFixed(2));
        let xCuadrado = parseFloat((x ** 2).toFixed(2));

        let xy = parseFloat((x * y).toFixed(2));

        // mostrar los valores en la fila
        fila.innerHTML = `
          <td>${i + 1}</td>
          <td>${y}</td>
          <td>${x}</td>
          <td>${xCuadrado}</td>
          <td>${yCuadrado}</td>
          <td>${xy}</td>
        `;

        // añadir a la tbala
        bodyTable.appendChild(fila);
    }

    // suma de x, y, x^2, y^2 y x*y usando el metoodo map() se crea otro array dependiendo de los paramtros
    let sumaX = sumarArray(arrayX);
    let sumaY = sumarArray(arrayY);
    let sumaXCuadrado = sumarArray(arrayX.map(x => x ** 2));
    let sumaYCuadrado = sumarArray(arrayY.map(y => y ** 2));
    let sumaXY = sumarArray(arrayX.map((x, i) => x * arrayY[i]));

    // crear una nueva fila a la tabla
    let filaSumatoria = document.createElement("tr");

    // fondo verde
    filaSumatoria.style.backgroundColor = "lightgreen";
    filaSumatoria.classList.add("table-dark");
    // contenido para mostrar en la ultima fila
    filaSumatoria.innerHTML = `
        <td><strong>Suma</strong></td>
        <td>${sumaY}</td>
        <td>${sumaX}</td>
        <td>${sumaXCuadrado}</td>
        <td>${sumaYCuadrado}</td>
        <td>${sumaXY}</td>
    `;

    // añadir una nueva fila a la tabla
    bodyTable.appendChild(filaSumatoria);

    // capturar los elmentos para los coeficientes
    let beta0 = document.getElementById("beta0");
    let beta1 = document.getElementById("beta1");
    let modeloEstimado = document.getElementById("modeloEstimado");

    // numero de datos n
    let n = arrayY.length;

    // calculo del coeficiente b1
    let b1 = (n * sumaXY - sumaX * sumaY) / (n * sumaXCuadrado - sumaX * sumaX);
    let b = parseFloat(b1.toFixed(2));

    // calculo del coeficiente b0
    let b0 = (sumaY - b * sumaX) / n;

    // mostrar los valores de los coeficientes
    let a = parseFloat(b0.toFixed(2));

    beta0.innerText = `${a}`;
    beta1.innerText = `${b}`;

    if (b1 < 0) {
        modeloEstimado.innerHTML = `${a} ${b}`;
    } else {
        modeloEstimado.innerHTML = `${a} + ${b}`;
    }

    // calculo de invervalo de confianza
    let xPrueba = document.getElementById("xPrueba").value;
    let alfa = document.getElementById("alfa").value;
    xPrueba = parseFloat(xPrueba);
    alfa = parseFloat(alfa);

    let yEstimado = parseFloat(calcularModeloEstimado(a, b, xPrueba));


    // seleccionar todos los elementos con la clase xValorPrueba
    let xPruebaElements = document.getElementsByClassName("valorXPrueba");

    // dar el mismo valor a todos
    for (let i = 0; i < xPruebaElements.length; i++) {
        xPruebaElements[i].textContent = xPrueba;
    }

    document.getElementById("nroDatos").innerText = n;

    document.getElementById("alfaR").innerText = alfa;
    document.getElementById("yEstimado").innerText = `${yEstimado.toFixed(2)}`;

    // para el campo T(alfa, gl)
    let p = 1 - alfa / 2;
    let gl = n - 2;
    // calculando la distribucion T-Student con gl grados de libertad y probabilidad p
    let distrT = parseFloat(calculatT(gl, p));

    // mostrar la probabilidad p, grados de libertad gl y la distribucion T-Student
    document.getElementById("p").innerText = p;
    document.getElementById("gradoLibertad").innerText = gl;
    document.getElementById("distrT").innerText = distrT;

    // calculo del cme (Cuadrados Medios del Error)
    let mediaX = parseFloat(jStat.mean(arrayX));
    let mediaY = parseFloat(jStat.mean(arrayY));

    // calculando CME y SC(X)
    let cmeC = parseFloat(calcularCME(n, sumaYCuadrado, mediaY, mediaX, b, sumaXY));
    let sc = parseFloat(calcularSC(n, sumaXCuadrado, mediaX));

    // mostrando CME y SC(X)
    document.getElementById("cme").innerText = cmeC;
    document.getElementById("scx").innerText = sc;

    // calculando intervalo de Prediccion izquierdo y derecho
    let inferiorP = parseFloat(calcularInterPred(n, yEstimado, distrT, cmeC, sc, xPrueba, mediaX));
    let superiorP = parseFloat(calcularInterPred(n, yEstimado, distrT * -1, cmeC, sc, xPrueba, mediaX));

    document.getElementById("intInferiorP").innerText = superiorP;
    document.getElementById("intSuperiorP").innerText = inferiorP;

    // calculando intervalo de Confianza izquierdo y derecho
    let inferiorC = parseFloat(calcularInterCon(n, yEstimado, distrT, cmeC, sc, xPrueba, mediaX));
    let superiorC = parseFloat(calcularInterCon(n, yEstimado, distrT * - 1, cmeC, sc, xPrueba, mediaX));

    document.getElementById("intInferiorC").innerText = superiorC;
    document.getElementById("intSuperiorC").innerText = inferiorC;
});


// funcion para convertir los datos de un array a numeros
function dataANum(datos) {
    return datos.map(dato => parseFloat(dato));
}

// verificar si los datos de un array  son numeros
function validar(datos) {
    for (const item of datos) {
        if (isNaN(item))
            return false;
    }
    return true;
}

// sumar los elmentos de  un array
function sumarArray(array) {
    // return array.reduce(function (acumulador, valor) {
    //     return acumulador + valor;
    // }, 0);
    return array.reduce((acumulador, valor) => acumulador + valor);
}

// calcular el valor Y de modelo estimado para un x dado
function calcularModeloEstimado(b0, b1, x) {
    return b0 + (b1 * x);
}

// suma de cuadrados medios del error
function calcularCME(n, sumaYCuadrado, promY, promX, b1, sumaXY) {
    let cme = ((sumaYCuadrado - n * promY * promY) + b1 * (sumaXY - n * promX * promY)) / (n - 1);
    return cme.toFixed(3);
}

// suma de cuadrados
function calcularSC(n, sumaXCuadrado, promX) {
    let sc = sumaXCuadrado - n * promX * promX;
    return sc.toFixed(3);
}


// calcular distribucion T - Student
function calculatT(gl, alfa) {
    let distT = jStat.studentt.inv(alfa, gl);
    return distT.toFixed(3);
}


function calcularInterPred(n, yEst, disT, cme, sc, xPrueba, xMedia) {
    let ip = yEst + disT * Math.sqrt(cme * (1 + (1 / n) + (xPrueba - xMedia) ** 2 / sc));
    return ip.toFixed(3);
}

function calcularInterCon(n, yEst, disT, cme, sc, xPrueba, xMedia) {
    let ic = yEst + disT * Math.sqrt(cme * ((1 / n) + (xPrueba - xMedia) ** 2 / sc));
    return ic.toFixed(3);
}