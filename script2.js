// capturar el boton para asignarle el evento
const botonCalcular = document.getElementById("btn-calcular");

// funcion para generar el body de la tabla de datos para las variables X e Y
botonCalcular.addEventListener("click", function () {
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


    /*********************** COEFICIENTE DE CORRELACION r ***********************/

    // obtener el elmento tabla
    let bodyTable1 = document.getElementById("resultados-corre");
    bodyTable1.innerHTML = "";

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
        bodyTable1.appendChild(fila);
    }

    // suma de x, y, x^2, y^2 y x*y usando el metoodo map() se crea otro array dependiendo de los paramtros
    let sumaX = sumarArray(arrayX);
    let sumaY = sumarArray(arrayY);
    let sumaXCuadrado = sumarArray(arrayX.map(x => x ** 2));
    let sumaYCuadrado = sumarArray(arrayY.map(y => y ** 2));
    let sumaXY = sumarArray(arrayX.map((x, i) => x * arrayY[i]));

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




    let r_cal = calcularCoeCorr(n, sumaXY, sumaX, sumaY, sumaXCuadrado, sumaYCuadrado);
    document.getElementById("valor-r").innerText = r_cal;

    // calculo de los limites < r <

    // mostrar significado


    if (r_cal === -1) {
        document.getElementById("intervalo-r").innerText = r_cal + " = -1";
        document.getElementById("relacion-r").innerText = "Correlacion Inversa Perfecta";
    } else if (r_cal === 1) {
        document.getElementById("intervalo-r").innerText = r_cal + " = 1";
        document.getElementById("relacion-r").innerText = "Correlacion Directa Perfecta";
    } else if (r_cal > -1 && r_cal < -0.8) {
        document.getElementById("intervalo-r").innerText = "-1 < " + r_cal + " < -0.8";
        document.getElementById("relacion-r").innerText = "Relacion Inversa Intensa";
    } else if (r_cal > -0.8 && r_cal < 0) {
        document.getElementById("intervalo-r").innerText = "-0.8 < " + r_cal + " < 0";
        document.getElementById("relacion-r").innerText = "Relacion Inversa Debil";
    } else if (r_cal > 0 && r_cal < 0.8) {
        document.getElementById("intervalo-r").innerText = "0 < " + r_cal + " < 0.8";
        document.getElementById("relacion-r").innerText = "Relacion Directa Debil";
    } else if (r_cal > 0.8 && r_cal < 1) {
        document.getElementById("intervalo-r").innerText = "0.8 < " + r_cal + " < 1";
        document.getElementById("relacion-r").innerText = "Relacion Directa Intensa";
    }


    // -------------------- calculo de coeficiente de determinacion R^2

    // capturar los elmentos para los coeficientes
    let modeloEstimado = document.getElementById("modeloEstimado");
// calculo del coeficiente b1
    let b1 = (n * sumaXY - sumaX * sumaY) / (n * sumaXCuadrado - sumaX * sumaX);
    b1 = b1.toFixed(2); // redondear a dos decimales
    // calculo del coeficiente b0
    let b0 = (sumaY - b1 * sumaX) / n;
    b0 = parseFloat(b0.toFixed(2)); // redondeo a dos decimales


    if (b1 < 0) {
        modeloEstimado.innerHTML = `${b0} ${b1}`;
    } else {
        modeloEstimado.innerHTML = `${b0} + ${b1}`;
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
        let yEs = calcularModeloEstimado(b0, b1, x).toFixed(2);

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
    // calculando R2
    let r2 = parseFloat((sumaSCR / (sumaSCR + sumaSCE)).toFixed(2));
    document.getElementById("valor-R2").innerText = `${r2}` + `= ${(r2 * 100).toFixed(0)}%`;
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

function calcularCoeCorr(n, sumaXY, sumaX, sumaY, sumaX2, sumaY2) {
    let r = (n * sumaXY - sumaX * sumaY) / (Math.sqrt(n * sumaX2 - (sumaX ** 2)) * Math.sqrt(n * sumaY2 - (sumaY ** 2)));
    return parseFloat(r.toFixed(2));
}