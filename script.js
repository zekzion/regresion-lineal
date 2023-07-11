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
        let yCuadrado = y ** 2;
        let xCuadrado = x ** 2;

        let xy = x * y;

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
    b1 = b1.toFixed(2); // redondear a dos decimales
    // calculo del coeficiente b0
    let b0 = (sumaY - b1 * sumaX) / n;
    b0 = parseFloat(b0.toFixed(2)); // redondeo a dos decimales

    // mostrar los valores de los coeficientes
    beta0.innerText = `${b0}`;
    beta1.innerText = `${b1}`;

    if (b1 < 0) {
        modeloEstimado.innerHTML = `${b0} ${b1}`;
    } else {
        modeloEstimado.innerHTML = `${b0} + ${b1}`;
    }

    // calculo de invervalo de confianza
    let xPrueba = document.getElementById("xPrueba").value;
    let alfa = document.getElementById("alfa").value;
    xPrueba = parseFloat(xPrueba);
    alfa = parseFloat(alfa);

    let yEstimado = parseFloat(calcularModeloEstimado(b0, b1, xPrueba).toFixed(2));

    document.getElementById("valorXPrueba").innerText = xPrueba;
    document.getElementById("valorXPrueba1").innerText = xPrueba;
    document.getElementById("alfaR").innerText = alfa;
    document.getElementById("yEstimado").innerText = yEstimado;

    // para el campo T(alfa, gl)
    let p = 1 - alfa / 2;
    let gl = n - 2;
    let distrT = parseFloat(calculatT(gl, p));

    document.getElementById("p").innerText = p;
    document.getElementById("gradoLibertad").innerText = gl;
    document.getElementById("distrT").innerText = distrT;

    // calculo del cme
    let mediaX = parseFloat(jStat.mean(arrayX));
    let mediaY = parseFloat(jStat.mean(arrayY));

    // calculando CME y SC(X)
    let cmeC = parseFloat(calcularCME(n, sumaYCuadrado, mediaY, mediaX, b1, sumaXY));
    let sc = parseFloat(calcularSC(n, sumaXCuadrado, mediaX));

    // calculando intervalo inferior
    let inferior = yEstimado + distrT * Math.sqrt(cmeC*(1+(1/n)+ (xPrueba-mediaX)**2/sc));
    let superior = yEstimado - distrT * Math.sqrt(cmeC*(1+(1/n)+ (xPrueba-mediaX)**2/sc));

    document.getElementById("intInferior").innerText = superior.toFixed(3);
    document.getElementById("intSuperior").innerText = inferior.toFixed(3);


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
    return  b0 + (b1 * x);
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
