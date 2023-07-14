// variable que guardara la instancia de la grafica
let grafica;

// capturar el boton para asignarle el evento
const buttonProcesar = document.getElementById("btn-procesar");

// funcion para generar el body de la tabla de datos para las variables X e Y
buttonProcesar.addEventListener("click", function () {
    // obtener los datos X e Y quitando espacios y comas
    let arrayX1 = document.getElementById("datosX1").value.replace(/\s/g, '').split(",");
    let arrayX2 = document.getElementById("datosX2").value.replace(/\s/g, '').split(",");
    let arrayY = document.getElementById("datosY").value.replace(/\s/g, '').split(",");

    // convertir grupo de datos a numeros float
    arrayX1 = dataANum(arrayX1);
    arrayX2 = dataANum(arrayX2);
    arrayY = dataANum(arrayY);

    // validar que sean numeros
    if (!validar(arrayX1) || !validar(arrayY) || !validar(arrayX2)) {
        alert("Los datos deben ser numeros!");
        return;
    }

    // si la longitud de los array no son iguales, terminar la ejecucion
    if (arrayX1.length !== arrayX2.length && arrayX2.length !== arrayY) {
        alert("La cantidad de datos de X e Y deben ser iguales!!");
        return;
    }


    // obtener el elmento tabla
    let bodyTabla = document.getElementById("resultados-multiple");
    bodyTabla.innerHTML = "";

    // loop que genera nuevas filas con los valores calculados
    for (let i = 0; i < arrayX1.length; i++) {
        let fila = document.createElement("tr");

        // calcular valores
        let x1 = arrayX1[i];
        let x2 = arrayX2[i];
        let y = arrayY[i];
        let x1y = parseFloat((x1 * y).toFixed(2));
        let x2y = parseFloat((x2 * y).toFixed(2));
        let x1x2 = parseFloat((x1 * x2).toFixed(2));
        let x1Cuadrado = parseFloat((x1 ** 2).toFixed(2));
        let x2Cuadrado = parseFloat((x2 ** 2).toFixed(2));


        // mostrar los valores en la fila
        fila.innerHTML = `
          <td>${i + 1}</td>
          <td>${y}</td>
          <td>${x1}</td>
          <td>${x2}</td>
          <td>${x1y}</td>
          <td>${x2y}</td>
          <td>${x1x2}</td>
          <td>${x1Cuadrado}</td>
          <td>${x2Cuadrado}</td>
        `;

        // añadir a la tbala
        bodyTabla.appendChild(fila);
    }

    // suma de x, y, x^2, y^2 y x*y usando el metoodo map() se crea otro array dependiendo de los paramtros
    let sumaY = sumarArray(arrayY);
    let sumaX1 = sumarArray(arrayX1);
    let sumaX2 = sumarArray(arrayX2);
    let sumax1y = redondear2Deci(parseFloat(sumarArray(arrayX1.map((x, i) => x * arrayY[i]))));
    let sumax2y = redondear2Deci(parseFloat(sumarArray(arrayX2.map((x, i) => x * arrayY[i]))));
    let sumax1x2 = redondear2Deci(parseFloat(sumarArray(arrayX1.map((x, i) => x * arrayX2[i]))));
    let sumax1Cuadrado = redondear2Deci(parseFloat(sumarArray(arrayX1.map(x => x ** 2))));
    let sumax2Cuadrado = redondear2Deci(parseFloat(sumarArray(arrayX2.map(y => y ** 2))));

    // crear una nueva fila a la tabla
    let filaSumatoria = document.createElement("tr");

    // fondo verde
    filaSumatoria.style.backgroundColor = "lightgreen";
    filaSumatoria.classList.add("table-dark");
    // contenido para mostrar en la ultima fila
    filaSumatoria.innerHTML = `
        <td><strong>Suma</strong></td>
        <td>${sumaY}</td>
        <td>${sumaX1}</td>
        <td>${sumaX2}</td>
        <td>${sumax1y}</td>
        <td>${sumax2y}</td>
        <td>${sumax1x2}</td>
        <td>${sumax1Cuadrado}</td>
        <td>${sumax2Cuadrado}</td>
    `;

    // añadir una nueva fila a la tabla
    bodyTabla.appendChild(filaSumatoria);

    // numero de datos n
    let n = arrayY.length;

    // capturar los elmentos para las ecuaciones
    let ec1 = document.getElementById("ec1");
    let ec2 = document.getElementById("ec2");
    let ec3 = document.getElementById("ec3");

    ec1.innerHTML = `${sumaY} = (${n})b<sub>0</sub> + b<sub>1</sub>(${sumaX1}) + b<sub>2</sub>(${sumaX2})`;
    ec2.innerHTML = `${sumax1y} = (${sumaX1})b<sub>0</sub> + b<sub>1</sub>(${sumax1Cuadrado}) + b<sub>2</sub>(${sumax1x2})`;
    ec3.innerHTML = `${sumax2y} = (${sumaX2})b<sub>0</sub> + b<sub>1</sub>(${sumax1x2}) + b<sub>2</sub>(${sumax2Cuadrado})`;



    // calculo de los coeficientes de la ecuacion de x1 y x2

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

function redondear2Deci(n) {
    return Math.round(n * 100) / 100;
}
