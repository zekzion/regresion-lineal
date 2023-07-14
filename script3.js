// importar DITRIBUCION FISHER
import quantile from 'https://cdn.jsdelivr.net/gh/stdlib-js/stats-base-dists-f-quantile@esm/index.mjs';

// capturar el boton para asignarle el evento
const botonCalcular = document.getElementById("btn-calcular");

// funcion para generar el body de la tabla de datos para las variables X e Y
botonCalcular.addEventListener("click", function () {
    // obtener los datos X e Y quitando espacios y comas
    let arrayX = document.getElementById("datosX").value.replace(/\s/g, '').split(",");
    let arrayY = document.getElementById("datosY").value.replace(/\s/g, '').split(",");
    let significancia = document.getElementById("alfa").value.replace(/\s/g, '').split(",");
    let alfa  = parseFloat(significancia);

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

    if (alfa < 0 || isNaN(alfa) || alfa >= 1) {
        return;
    }


    /*********************** PARTE 1 ***********************/

    // MOSTRANDO ALFA

    document.getElementById("signi").innerText = alfa;

        // obtener el elmento tabla
    let bodyTable1 = document.getElementById("resultados-corre");
    bodyTable1.innerHTML = "";

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
        bodyTable1.appendChild(fila);
    }

    // suma de x, y, x^2, y^2 y x*y usando el metoodo map() se crea otro array dependiendo de los paramtros
    let sumaX = parseFloat(sumarArray(arrayX));
    let sumaY = parseFloat(sumarArray(arrayY));
    let sumaXCuadrado = parseFloat(sumarArray(arrayX.map(x => x ** 2)));
    let sumaYCuadrado = parseFloat(sumarArray(arrayY.map(y => y ** 2)));
    let sumaXY = parseFloat(sumarArray(arrayX.map((x, i) => x * arrayY[i])));

    // crear una nueva fila a la tabla
    let filaSumatoria1 = document.createElement("tr");

    // fondo verde
    filaSumatoria1.style.backgroundColor = "lightgreen";
    filaSumatoria1.classList.add("table-dark");
    // contenido para mostrar en la ultima fila
    filaSumatoria1.innerHTML = `
        <td><strong>Suma</strong></td>
        <td>${sumaY}</td>
        <td>${sumaX}</td>
        <td>${sumaXCuadrado}</td>
        <td>${sumaYCuadrado}</td>
        <td>${sumaXY}</td>
    `;

    // añadir una nueva fila a la tabla
    bodyTable1.appendChild(filaSumatoria1);


    // numero de datos n
    let n = arrayY.length;


    // -------------------- calculo de coeficiente de determinacion R^2

    // capturar los elmentos para los coeficientes
    let modeloEstimado = document.getElementById("modeloEstimado");

    // calculo del coeficiente b1
    let b1 = (n * sumaXY - sumaX * sumaY) / (n * sumaXCuadrado - sumaX * sumaX);
    let b = parseFloat(b1.toFixed(2));

    // calculo del coeficiente b0
    let b0 = (sumaY - b1 * sumaX) / n;
    let a = parseFloat(b0.toFixed(2));


    if (b < 0) {
        modeloEstimado.innerHTML = `${a} ${b}`;
    } else {
        modeloEstimado.innerHTML = `${a} + ${b}`;
    }

    // obtener el elmento tabla
    let bodyTable2 = document.getElementById("resultados-deter");
    bodyTable2.innerHTML = "";


    let mediaY = parseFloat(jStat.mean(arrayY).toFixed(2)); // obtener la media del array Y
    document.getElementById("mediaY").innerText = mediaY;

    const arraySCR = [];
    const arraySCE = [];


    // loop que genera nuevas filas con los valores calculados
    for (let i = 0; i < arrayX.length; i++) {
        let fila = document.createElement("tr");

        // calcular valores
        let x = arrayX[i];
        let y = arrayY[i];
        let yEs = parseFloat(calcularModeloEstimado(a, b, x)).toFixed(2);

        let scr = parseFloat(((yEs - mediaY) ** 2).toFixed(2));
        arraySCR[i] = scr;

        let sce = parseFloat(((y - yEs) ** 2).toFixed(2));
        arraySCE[i] = sce;

        // mostrar los valores en la fila
        fila.innerHTML = `
          <td>${i + 1}</td>
          <td>${y}</td>
          <td>${x}</td>
          <td>${yEs}</td>
          <td>${scr}</td>
          <td>${sce}</td>
        `;

        // añadir a la tbala
        bodyTable2.appendChild(fila);
    }


    // suma de x, y, x^2, y^2 y x*y usando el metoodo map() se crea otro array dependiendo de los paramtros
    let sumaSCR = sumarArray(arraySCR);
    let sumaSCE = sumarArray(arraySCE);

    // crear una nueva fila a la tabla
    let filaSumatoria = document.createElement("tr");

    // fondo verde
    filaSumatoria.style.backgroundColor = "lightgreen";
    filaSumatoria.classList.add("table-dark");
    // contenido para mostrar en la ultima fila
    filaSumatoria.innerHTML = `
        <td><strong>Suma</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${sumaSCR.toFixed(2)}</td>
        <td>${sumaSCE.toFixed(2)}</td>
    `;

    // añadir una nueva fila a la tabla
    bodyTable2.appendChild(filaSumatoria);

    sumaSCR = parseFloat(sumaSCR.toFixed(2));
    sumaSCE = parseFloat(sumaSCE.toFixed(2));


    // mostrar SCR, SCE, SCT
    document.getElementById("scr").innerText = sumaSCR;
    document.getElementById("sce").innerText = sumaSCE;
    document.getElementById("sct").innerText = (sumaSCR + sumaSCE);

    /** generar el cuerpo del cuadro anova **/
    // columna grados de libertad GL
    document.getElementById("gl-regresion").innerText = 1;
    document.getElementById("gl-error").innerText = n - 2;
    document.getElementById("gl-total").innerText = n - 1;

    // columna suma de cuadrados SC
    document.getElementById("scr-r").innerText = sumaSCR;
    document.getElementById("sce-error").innerText = sumaSCE;
    document.getElementById("sct-total").innerText = sumaSCR + sumaSCE;

    // columna cuadrados medios CM
    document.getElementById("cm-r").innerText = sumaSCR;
    let cmE = redondear2Deci(parseFloat(sumaSCE / (n - 2)));

    document.getElementById("cm-error").innerText = cmE;

    // columna Fc
    let fcal = redondear2Deci(sumaSCR/ cmE);
    document.getElementById("est-fisher-c").innerText = fcal;

    //columna fisher tabla de FISHER



    let p = 1 - alfa;
    let glNumerador = 1;
    let glDenominador = n - 2;

    // para 1 - alfa = 0.95
    let fisher_tabla = redondear2Deci(quantile(p, glNumerador, glDenominador));

    document.getElementById("est-fisher-t").innerText = fisher_tabla;

    // decision comparando FC Y FT
    if (fcal > fisher_tabla) {
        document.getElementById("decision").innerText = "Se rechaza H0";
    } else {
        document.getElementById("decision").innerText = "NO Se rechaza H0";
    }

});


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

function calcularModeloEstimado(b0, b1, x) {
    return b0 + (b1 * x);
}

function redondear2Deci(n) {
    return Math.round(n * 100) / 100;
}
