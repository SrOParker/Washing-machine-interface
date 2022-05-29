/*--------Electrodoméstico----------------------*/
var electro = new Electro();
/*----------------------------------------------*/
/*--------Variables de control----------------------*/
var EoA = false;//true -> encendido false->apagado
var apagado1vez=0;//controla que el lavado salga con el margen correcto en todo momento 
var lavado = false;//false ->fuera de lavado true->dentro de lavado
var tempL=false;
var lavadoraPuesta = false;
var secadoraPuesta = false;
var primeraVezDespuesDeLavado=0;
var secado = false;
var done =false;

var inicio = false;

var dondeEstoy =-1; //con esta variable detecto si estoy en la zona de lavar o la de secar para actualizar siguientePaso
/*---------------------------------------------------*/
/*--------------------VARIABLES DE LAVADO------------------------------------------------------------*/
var tiempoLavado = 0;
var temperaturaLavado=0;
var colorLavado=false;
var revolucionesLavado = 0;
var suavizanteLavado=0;
var detergenteLavado=0;
var nombPrograma="";
var numeroPrograma;
/*----------------------------------------------------------------------------------------------------*/
/*--------------------VARIABLES DE SECADO------------------------------------------------------------*/
var tiempoSecado = 0;
var temperaturaSecado=0;
var revolucionesSecado = 0;
var nombProgramaSecado="";
var humedadSecado =0;
var antiarrugado = true;
/*----------------------------------------------------------------------------------------------------*/
/*------------------------VARIABLES FAVORITO--------------------------------------------*/
//                   [Sintéticos, Delicados, Algodón, Tejidos Gruesos, Quita Manchas, Rápido, Centrifugado, Silencioso]
var arrayFavLavado = [0,0,0,0,0,0,0,0];
var arrayFavSecado = [0,0,0,0,0,0,0,0];
/*--------------------------------------------------------------------*/
var tiempoGlobal =0;
function favorito(){
    let posicionL;
    let auxL=0;
    let posicionS;
    for ( let i = 0 ; i < arrayFavLavado.length; i++ ){
        if (arrayFavLavado[i]>auxL){
            posicionL = i;
        }
    }
    for ( let i = 0 ; i < arrayFavSecado.length; i++ ){
        if (arrayFavSecado[i]>auxL){
            posicionS = i;
        }
    }
    seleccionLavado(posicionL);
    seleccionSecado(posicionS);
    dondeEstoy =1;
    siguientePaso1();
    dondeEstoy = 2;
    siguientePaso1();
    
    return false;

}
// Llena un deposito hasta un nivel usando un sensor de nivel y una valvula que abre el flujo
function llenar(sensor, valvula, nivel, callback) {

    console.log("  - Llenar depósito.", sensor, "->", nivel);
    electro.on(sensor, function comprobarNivel(nivelActual) { // monitorizar el sensor
        if (nivelActual >= nivel) { // se ha alzanzado el nivel
            electro.off(sensor, comprobarNivel); // dejar de monitorizar
            console.log("    - Cerrar válvula:", valvula);
            electro[valvula] = false; // cerrar la válvula
            if (electro.temperaturaAgua < temperaturaLavado){
                electro.resistenciaAgua = true;
            }else{
                electro.resistenciaAgua = false;
            }
            callback();
        }
    });
    console.log("    - Abrir válvula:", valvula);
    electro[valvula] = true; // abro la topa
}

// Vaciar un deposito hasta un nivel usando un sensor de nivel y una válvula que abre el flujo
function vaciar(sensor, valvula, nivel, callback) {
    console.log("  - Vaciar depósito.", sensor, "->", nivel);
    electro.on(sensor, function comprobarNivel(nivelActual) { // monitorizar el sensor
        if (nivelActual <= nivel) { // se ha alzanzado el nivel
            electro.off(sensor, comprobarNivel); // dejar de monitorizar
            console.log("    - Cerrar válvula:", valvula);
            electro[valvula] = false; // cerrar la válvula
            callback();
        }
    });
    console.log("    - Abrir válvula:", valvula);
    electro[valvula] = true; // abro la topa
}

// Establece una temperatura a un valor, encendiendo y apagando una resistencia durante un tiempo (ms)
function termostato(sensor, resistencia, temp, duracion, callback) {
    function comprobarTemp() {
        if (electro.temperaturaAgua < temperaturaLavado) electro.resistenciaAgua = true;
        if (electro.temperaturaAgua > temperaturaLavado) electro.resistenciaAgua = false;
    }
    electro.on("temperaturaAgua", comprobarTemp);
    setTimeout(function () {
        electro[electro.resistenciaAgua] = false;
        electro.off(electro.temperaturaAgua, comprobarTemp);
        callback();
    }, duracion);//18000
}
function termostatoAire(duracion, callback) {
    console.log("Aire calentandose...");
    function comprobarTemp() {
        if (electro.temperaturaAire < temperaturaSecado) electro.resistenciaAire = true;
        if (electro.temperaturaAire > temperaturaSecado) electro.resistenciaAire = false;
    }
    electro.on("temperaturaAire", comprobarTemp);
    setTimeout(function () {
        electro[electro.resistenciaAire] = false;
        electro.off(electro.temperaturaAire, comprobarTemp);
        callback();
    }, duracion);//18000
}
electro.on("connect", function () { // Esparar a que la librería se conecte con la lavadora
    console.log("Ya estoy conectado con la lavadora!!")
    console.log("Con este hay " + electro.clientes + " clientes conectados");

});

//presencia de alguien activa la interfaz y la desactiva
/*
electro.on("presencia", function () { // Esparar a que la librería se conecte con la lavadora
    if(EoA !=true){
        if (electro.presencia ==false){
            document.getElementById("divEncender").setAttribute('style','display:none;');
        }else{
            document.getElementById("divEncender").removeAttribute('style');
        }
    }

});*/
function comprobarFav (){
    let comprueba1 = false;
    let comprueba2 = false;
    console.log(arrayFavLavado);
    console.log(arrayFavSecado);
    for (let i = 0; i < arrayFavLavado.length; i++){
        if (arrayFavLavado[i]!=0){
            comprueba1 = true;
        }
    }
    for (let i = 0; i < arrayFavSecado.length; i++){
        if (arrayFavSecado[i]!=0){
            comprueba2 = true;
        }
    }
    
    if (comprueba1 && comprueba2){
        document.getElementById("botonFav").style.color ="#fff";
        document.getElementById("botonFav").setAttribute('onclick', 'return favorito();')
        console.log("hay fav");

    }else{
        console.log("no hay fav");
        document.getElementById("botonFav").style.color ="#565656";
        document.getElementById("botonFav").removeAttribute('onclick');
    }
}
/*Encender y apagar lavadora*/
function encenderYapagarLavadora(){
    if (EoA == false){ //encender
        document.getElementById("divEncender").setAttribute('style','display:none;');
        document.getElementById("pantallaEncendida").removeAttribute('style');
        EoA = true;
        comprobarFav();
        inicio =true;
    }else{//apagar
        document.location.href ="";
        lavado =false;
        apagado1vez = 1;

        EoA=false;
        dondeEstoy=1;
        lavadoraPuesta = false;
        secadoraPuesta = false;
    }

    return false;
}

function comprobarPuerta(){
    
        if (electro.on("peso", function (bloqueado) {
            if (inicio == true){
                if (lavado == true){
                    document.getElementById("programaLavado").setAttribute('style', 'display:none;');
                }
                if (secado == true){
                    document.getElementById("programaLavado").setAttribute('style', 'display:none;');
                }
                if (EoA == true){
                    if (electro.puertaAbierta ==true){
                        document.getElementById("pantallaEncendida").setAttribute('style','display:none;');
                        document.getElementById("puertaAbierta").removeAttribute('style');
                        pasarPeso();
                        detergenteYsuavizanteMedidores();          
                        if (secadoraPuesta || lavadoraPuesta){
                            setTimeout(volverAinicio2,4000);
                        }else{
                            setTimeout(volverAinicio,4000);
                        }
                        
                    }
                } 
            }
        }));
        if (electro.on("nivelDetergente", function (bloqueado) {
            if(inicio == true){
                if (lavado == true){
                    document.getElementById("programaLavado").setAttribute('style', 'display:none;');
                }
                if (EoA == true){
                    if (electro.puertaAbierta ==true){
                        document.getElementById("pantallaEncendida").setAttribute('style','display:none;');
                        document.getElementById("puertaAbierta").removeAttribute('style');
                        pasarPeso();
                        detergenteYsuavizanteMedidores();
                        if (secadoraPuesta || lavadoraPuesta){
                            setTimeout(volverAinicio2,4000);
                        }else{
                            setTimeout(volverAinicio,4000);
                        }
                    }
                } 
            }
        }));
    
        if (electro.on("nivelSuavizante", function (bloqueado) {
            if (inicio == true){
                if (lavado == true){
                    document.getElementById("programaLavado").setAttribute('style', 'display:none;');
                }
                if (EoA == true){
                    if (electro.puertaAbierta ==true){
                        document.getElementById("pantallaEncendida").setAttribute('style','display:none;');
                        document.getElementById("puertaAbierta").removeAttribute('style');
                        pasarPeso();
                        detergenteYsuavizanteMedidores();
                        if (secadoraPuesta || lavadoraPuesta){
                            setTimeout(volverAinicio2,4000);
                        }else{
                            setTimeout(volverAinicio,4000);
                        }
                        
                    }
                } 
            }
        }));
    

   
}

function volverAinicio2(){
    inicio = true;
    if(lavado == true){
        document.getElementById("programaLavado").removeAttribute('style');
    }
    document.getElementById("pantallaEncendida").removeAttribute('style');
    document.getElementById("puertaAbierta").setAttribute('style','display:none;');
    document.getElementById("programaLavado").setAttribute('style', 'display:none;');
    document.getElementById("enproceso").setAttribute('style','display:none;');
    document.getElementById("circuloLavado").setAttribute('style','display:none;');
    document.getElementById("circuloSecado").setAttribute('style','display:none;');
    document.getElementById("barracentral").setAttribute('style','display:none;');
    document.getElementById("p-textoProgramas1").setAttribute('style','display:none;');
    document.getElementById("p-textoProgramas").setAttribute('style','display:none;');
    document.getElementById("tiempo1").setAttribute('style','display:none;');
    document.getElementById("tiempo2").setAttribute('style','display:none;');
    document.getElementById("circuloSecado").style.textAlign = "auto";
    document.getElementById("conjunto").style.marginLeft ="0";
    document.getElementById("tiempo2").style.marginLeft ="0";
    document.getElementById("circuloSecado").style.marginLeft ="0";
    document.getElementById("todo").removeAttribute('style');

    comprobarFav();
}
function volverAinicio(){
    inicio = true;
    if(lavado == true){
        document.getElementById("programaLavado").removeAttribute('style');
    }
    document.getElementById("pantallaEncendida").removeAttribute('style');
    document.getElementById("puertaAbierta").setAttribute('style','display:none;');
    document.getElementById("programaLavado").setAttribute('style', 'display:none;');
    document.getElementById("enproceso").setAttribute('style','display:none;');
    document.getElementById("circuloLavado").setAttribute('style','display:none;');
    document.getElementById("circuloSecado").setAttribute('style','display:none;');
    document.getElementById("barracentral").setAttribute('style','display:none;');
    document.getElementById("p-textoProgramas1").setAttribute('style','display:none;');
    document.getElementById("p-textoProgramas").setAttribute('style','display:none;');
    document.getElementById("tiempo1").setAttribute('style','display:none;');
    document.getElementById("tiempo2").setAttribute('style','display:none;');
    document.getElementById("circuloSecado").style.textAlign = "auto";
    document.getElementById("conjunto").style.marginLeft ="0";
    document.getElementById("tiempo2").style.marginLeft ="0";
    document.getElementById("circuloSecado").style.marginLeft ="0";
    document.getElementById("todo").removeAttribute('style');
    if (lavadoraPuesta || secadoraPuesta){
        lavadoraPuesta =false;
        secadoraPuesta =false;
        done=false;
        volverDeLavado();
        document.getElementById("programQuit").setAttribute('style', 'display:none;');
        document.getElementById("lavarSeleccionado").setAttribute('style', 'display:none;');
        document.getElementById("secarSeleccionado").setAttribute('style', 'display:none;');

    }
    comprobarFav();
}
function volverDeLavado(){
    dondeEstoy =-1; inicio = true;
    if (primeraVezDespuesDeLavado !=0){
        document.getElementById('programasL').style.marginLeft = "0";
    }
    quitarSeleccionados(20);
    quitarSeleccionadosSecado(20);
    document.getElementById("ProgramarSecado").removeAttribute('style');
    document.getElementById("ProgramarLavado").removeAttribute('style');
    document.getElementById("humSelect2").setAttribute('style','display:none;');
    document.getElementById("timeSelect2").setAttribute('style','display:none;');
    document.getElementById("programasS").style.borderRight="none";
    document.getElementById("tempSelect2").setAttribute('style','display:none;');
    document.getElementById("configSecado2").setAttribute('style', 'display:none;')
    document.getElementById("revSelect").setAttribute('style','display:none;');
    document.getElementById("timeSelect").setAttribute('style','display:none;');
    document.getElementById("programasL").style.borderRight="none";
    document.getElementById("tempSelect").setAttribute('style','display:none;');
    document.getElementById("configLavado2").setAttribute('style', 'display:none;');
    document.getElementById("divLyS").removeAttribute('style');
    document.getElementById("divHeader").removeAttribute('style');
    document.getElementById("pantallaEncendida").removeAttribute('style');
    document.getElementById("programaLavado").setAttribute('style','display:none;');
    document.getElementById("siguientePaso").setAttribute('style','display:none;');
    document.getElementById("botonPlay").removeAttribute('style');
    document.getElementById("botonPlay").setAttribute('style', 'color: rgb(61, 61, 61);');
    if (lavadoraPuesta == true){
        document.getElementById("ProgramarLavado").setAttribute('style','display:none;');
    }else if (secadoraPuesta == true){
        document.getElementById("ProgramarSecado").setAttribute('style','display:none;');
    }
}

function pasarPeso(){
    let cadena ="";
    let cifra;
    let pesoActual = electro.peso;
    pesoActual = pesoActual/1000;
    html = '';
    html = `${pesoActual} kg`;
    document.querySelector("#kilos").innerHTML=html;
    
    //calculamos la cifra en porcentaje de los kilos y llamamos a nuestra clase de giro según la cifra
    cifra = (electro.peso * 100) / 5000;
    cifra = cifra; 
    if (cifra <=50){
        cadena = `progress-circle p${cifra}`;
    }else{
        cadena = `progress-circle over50 p${cifra}`;
    }
    document.querySelector("#ruedaKilos").setAttribute('class', cadena);
}

function detergenteYsuavizanteMedidores(){
    let deter = (200 - electro.nivelDetergente *2);
    let suav = (200 - electro.nivelSuavizante *2);
    console.log(deter);
    console.log(suav);
    let cadenaD = `height:${deter}px;`;
    let cadenaS = `height:${suav}px;`;
    document.querySelector(".barraInteriorI").setAttribute('style', cadenaD);
    document.querySelector(".barraInteriorD").setAttribute('style', cadenaS);
}

function irALavado(){console.log("holaaaaaa");
    inicio = false;
    if (apagado1vez==1){
        document.getElementById("configLavado").style.marginLeft = "0";
    }
    lavado = true;
    document.getElementById("divLyS").setAttribute('style','display:none');
    document.getElementById("divHeader").setAttribute('style','display:none;');
    document.getElementById("puertaAbierta").setAttribute('style','display:none;');
    document.getElementById("programaLavado").removeAttribute('style');
    document.getElementById("programasS").setAttribute('style','display:none;');
    document.getElementById("programasL").removeAttribute('style');
    document.getElementById("lavTitle").removeAttribute('style');
    document.getElementById("secTitle").setAttribute('style', 'display:none;');
    return false;

}
//seleccion de programa
function seleccionLavado(programa){
    dondeEstoy=1;
    if (electro.sensorColor>0){
        colorLavado = true;
    }else{colorLavado=false;}
    numeroPrograma = programa;
    switch (programa) {
        case 0://sinteticos
            nombPrograma = "Sintéticos";
            revolucionesLavado =800;
            tiempoLavado = 90;
            temperaturaLavado = 40;
            detergenteLavado = 20;
            suavizanteLavado =10;
            arrayFavLavado[0]++;
            document.getElementById("p0").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Sintéticos';
            break;
        case 1://delicados
            nombPrograma = "Delicados";
            revolucionesLavado =400;
            tiempoLavado = 110;
            temperaturaLavado = 30;
            detergenteLavado = 15;
            suavizanteLavado =10;
            arrayFavLavado[1]++;
            document.getElementById("p1").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Delicados';
            break;
        case 2://algodon
            nombPrograma = "Algodón";
            revolucionesLavado =700;
            tiempoLavado = 150;
            temperaturaLavado = 40;
            detergenteLavado = 30;
            suavizanteLavado =5;
            arrayFavLavado[2]++;
            document.getElementById("p2").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Algodón';
            break;
        case 3://tejidos gruesos
            nombPrograma = "Tejidos Gruesos";
            revolucionesLavado =900;
            tiempoLavado = 180;
            temperaturaLavado = 60;
            detergenteLavado = 30;
            suavizanteLavado =20;
            arrayFavLavado[3]++;
            document.getElementById("p3").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Tejidos Gruesos';
            break;
        case 4://quita manchas
            nombPrograma = "Quita Manchas";
            revolucionesLavado =800;
            tiempoLavado = 100;
            temperaturaLavado = 60;
            detergenteLavado = 50;
            suavizanteLavado =10;
            arrayFavLavado[4]++;
            document.getElementById("p4").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Quita Manchas';
            break;
        case 5://rapido
            nombPrograma = "Rápido";
            revolucionesLavado =1100;
            tiempoLavado = 30;
            temperaturaLavado = 30;
            detergenteLavado = 15;
            suavizanteLavado =15;
            arrayFavLavado[5]++;
            document.getElementById("p5").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Rápido';
            break;
        case 6://centrifugado
            nombPrograma = "Centrifugado";
            revolucionesLavado =1500;
            tiempoLavado = 6;
            temperaturaLavado = 20;
            detergenteLavado = 0;
            suavizanteLavado =0;
            arrayFavLavado[6]++;
            document.getElementById("p6").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Centrifugado';
            break;
        case 7://silencioso
            nombPrograma = "Silencioso";
            revolucionesLavado =300;
            tiempoLavado = 160;//160/60
            temperaturaLavado = 40;
            detergenteLavado = 20;
            suavizanteLavado =10;
            arrayFavLavado[7]++;
            document.getElementById("p7").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Silencioso';
            break;
        default:
            break;
    }
    //coloco los valores de cada programa
    document.getElementById("temperaturaOpt").innerHTML= temperaturaLavado + "ºC";
    if (tiempoLavado>10){
        document.getElementById("tiempoOpt").innerHTML =Math.trunc(tiempoLavado/60)+":"+tiempoLavado%60+"h";
    }else{
        document.getElementById("tiempoOpt").innerHTML ="0:06h";
    }
    document.getElementById("revolOpt").innerHTML = revolucionesLavado+" rpm";
    if (colorLavado == true){
        document.getElementById("colOpt").innerHTML= 'Color <i class="fas fa-circle" style="vertical-align: middle; font-size: 15px;" ></i>' ;
    }else{
        document.getElementById("colOpt").innerHTML= 'Color <i class="far fa-circle" style="vertical-align: middle; font-size: 15px;" ></i>' ;
    }
    //consoles de ejemplo
    /*
    console.log('Revoluciones: '+revolucionesLavado);
    console.log('Tiempo: '+ Math.trunc(tiempoLavado/60) +':'+tiempoLavado%60);
    console.log('Temperatura: '+temperaturaLavado);
    console.log('Detergente: '+detergenteLavado);
    console.log('Suavizante: '+suavizanteLavado);
    let hay="";
    if(colorLavado == true){hay="Con ropa de color";}else{hay="Sin ropa de color";}
    console.log('Color: '+ hay);
    */
    document.getElementById("programasL").style.borderRight="2px solid var(--colorTexto)";
    document.getElementById("configLavado2").removeAttribute('style');
    document.getElementById("configLavado2").style.width = "30%";
    document.getElementById("configLavado").style.transition = "0.5s";
    document.getElementById("configLavado").style.marginLeft = "-150px";
    document.getElementById("siguientePaso").removeAttribute('style');
    quitarSeleccionados(programa); //quito posibles selecciones anteriores
    return false;
}

function quitarSeleccionados(valor){
   
    let html = "";
    if (valor !=0){
        html =" Sintéticos";
        document.getElementById("p0").innerHTML =html;
    }
    if (valor != 1){
        html =" Delicados";
        document.getElementById("p1").innerHTML =html;
    }
    if (valor != 2){
        html = " Algodón";
        document.getElementById("p2").innerHTML =html;
    }
    if (valor != 3){
        html =" Tejidos Gruesos";
        document.getElementById("p3").innerHTML =html;
    }
    if (valor != 4){
        html=" Quita Manchas";
        document.getElementById("p4").innerHTML =html;
    }
    if (valor != 5){
        html = " Rápido";
        document.getElementById("p5").innerHTML =html;
    }
    if (valor != 6){
        html = " Centrifugado";
        document.getElementById("p6").innerHTML =html;
    }
    if (valor != 7){
        html=" Silencioso"
        document.getElementById("p7").innerHTML =html;
    }
    return false;
}
/*Cambio temperatura en el lavado*/ 
function opcLavadoTemp(){
    document.getElementById("configLavado2").setAttribute('style','display:none;');
    document.getElementById("tempSelect").removeAttribute('style');
    return false;
}
function cambioTempLavado(valor){
    temperaturaLavado = valor;
    document.getElementById("tempSelect").setAttribute('style','display:none;');
    document.getElementById("configLavado2").removeAttribute('style');
    document.getElementById("temperaturaOpt").innerHTML = temperaturaLavado + "ºC";
    return false;
}
/*Cambio tiempo en el lavado*/ 
function opcLavadoTime(){
    document.getElementById("configLavado2").setAttribute('style','display:none;');
    document.getElementById("timeSelect").removeAttribute('style');
    return false;
}
function cambioTimeLavado(valor){
    tiempoLavado = valor;
    document.getElementById("timeSelect").setAttribute('style','display:none;');
    document.getElementById("configLavado2").removeAttribute('style');
    document.getElementById("tiempoOpt").innerHTML = Math.trunc(valor/60)+":"+valor%60+"h";
    return false;
}

/*Cambio revoluciones en el lavado*/ 
function opcLavadoRev(){
    document.getElementById("configLavado2").setAttribute('style','display:none;');
    document.getElementById("revSelect").removeAttribute('style');
    return false;
}
function cambioRevLavado(valor){
    revolucionesLavado = valor;
    document.getElementById("revSelect").setAttribute('style','display:none;');
    document.getElementById("configLavado2").removeAttribute('style');
    document.getElementById("revolOpt").innerHTML = valor +" rpm";
    return false;
}

function siguientePaso1(){

    if (dondeEstoy == 1){
        lavadoraPuesta = true;
        primeraVezDespuesDeLavado =1;
        volverDeLavado();
        document.getElementById("pselecNombre").removeAttribute('style');
        document.getElementById("pselecNombre2").removeAttribute('style');
        document.getElementById("botonPlay").removeAttribute('style');
        document.getElementById("botonPlay").setAttribute('style', 'color:#ffffff;');
        document.getElementById("ProgramarLavado").setAttribute('style', 'display:none;');
        if (secadoraPuesta == true){
            document.getElementById("ProgramarSecado").setAttribute('style', 'display:none;');
            document.getElementById("pselecNombre2").removeAttribute('style');
            
        }else{
            document.getElementById("quitarSeleccion2").setAttribute('style', 'display:none;');
            document.getElementById("pselecNombre2").setAttribute('style', 'display:none;');

            document.getElementById("pselecNombre").style.marginTop = "-80px";
            document.getElementById("seleccionesAmbosProgramas").style.marginTop = "-40px";
            
        }
        document.getElementById("select1").innerHTML = temperaturaLavado +"ºC";
        document.getElementById("select2").innerHTML = Math.trunc(tiempoLavado/60)+":"+tiempoLavado%60+"h";
        document.getElementById("select3").innerHTML = revolucionesLavado + " rpm";
        document.getElementById("pselecNombre").innerHTML = nombPrograma;
        document.getElementById("lavarSeleccionado").removeAttribute('style');
        document.getElementById("programQuit").removeAttribute('style');
        document.getElementById("quitarSeleccion").removeAttribute('style');
        document.getElementById("botonesQuitar").style.marginLeft = "50px";



    }else if (dondeEstoy ==2){
        secadoraPuesta =true;
        volverDeLavado();
       
        document.getElementById("botonPlay").removeAttribute('style');
        document.getElementById("botonPlay").setAttribute('style', 'color:#ffffff;');
        document.getElementById("ProgramarSecado").setAttribute('style', 'display:none;');
        document.getElementById("pselecNombre").removeAttribute('style');
        document.getElementById("pselecNombre2").removeAttribute('style');
        if (lavadoraPuesta == true){
            document.getElementById("ProgramarLavado").setAttribute('style', 'display:none;');
            document.getElementById("pselecNombre").removeAttribute('style');
        }else{
            document.getElementById("quitarSeleccion").setAttribute('style', 'display:none;');
            document.getElementById("pselecNombre").setAttribute('style','display:none;');
            
            document.getElementById("botonesQuitar").style.marginLeft = "425px ";
            //esto no va tieene que funcionar 510000000000000000000
        }
        document.getElementById("pselecNombre2").innerHTML = nombProgramaSecado;
        document.getElementById("select11").innerHTML = temperaturaSecado +"ºC";
        document.getElementById("select22").innerHTML = Math.trunc(tiempoSecado/60)+":"+tiempoSecado%60+"h";
        let html="";
        if (humedadSecado == 1 ){
            html+='<i class="far fa-sun"></i>';
        }else if (humedadSecado == 2 ){
            html+='<i class="far fa-sun"></i><i class="far fa-sun"></i>';
        }else if (humedadSecado == 3){
            html+='<i class="far fa-sun"></i><i class="far fa-sun"></i><i class="far fa-sun"></i>';
        }
        document.getElementById("select33").innerHTML =html;
        document.getElementById("secarSeleccionado").removeAttribute('style');        
        document.getElementById("programQuit").removeAttribute('style');
        document.getElementById("quitarSeleccion2").removeAttribute('style');
        /*
        document.getElementById("quitarSeleccion").setAttribute('style', 'display:none;');
        */

    }
    if (lavadoraPuesta ==false){
        document.getElementById("ProgramarLavado").removeAttribute('style');
        document.getElementById("pselecNombre").setAttribute('style', 'display:none;');
    }
    if (secadoraPuesta==false){
        document.getElementById("ProgramarSecado").removeAttribute('style');
       
    }
    return  false;
}

function quitarSeleccionLavado() {
    volverDeLavado();
    if (secadoraPuesta == true){
        document.getElementById("ProgramarSecado").setAttribute('style', 'display:none;');
        document.getElementById("quitarSeleccion").setAttribute('style', 'display:none;');
        document.getElementById("quitarSeleccion2").style.marginLeft ="550px";
        /*
        document.getElementById("pselecNombre").setAttribute('style','display:none;');
        */
    }else{
        
        document.getElementById("programQuit").setAttribute('style', 'display:none;');
        document.getElementById("botonPlay").removeAttribute('style');
        document.getElementById("botonPlay").setAttribute('style', 'color: rgb(61, 61, 61);');
 
    }
    lavadoraPuesta = false;
    document.getElementById("ProgramarLavado").removeAttribute('style');
    document.getElementById("pselecNombre").setAttribute('style','display:none;');
    document.getElementById("lavarSeleccionado").setAttribute('style','display:none;');
    return false;
}

function quitarSeleccionSecado() {
    volverDeLavado();
    if (lavadoraPuesta == true){
        document.getElementById("ProgramarLavado").setAttribute('style', 'display:none;');
        document.getElementById("quitarSeleccion2").setAttribute('style', 'display:none;');
        //document.getElementById("quitarSeleccion2").style.marginLeft ="550px";
        /*
        document.getElementById("pselecNombre").setAttribute('style','display:none;');
        */
    }else{
        
        document.getElementById("programQuit").setAttribute('style', 'display:none;');
        document.getElementById("botonPlay").removeAttribute('style');
        document.getElementById("botonPlay").setAttribute('style', 'color: rgb(61, 61, 61);');
 
    }
    secadoraPuesta = false;
    document.getElementById("ProgramarSecado").removeAttribute('style');
    document.getElementById("pselecNombre2").setAttribute('style','display:none;');
    document.getElementById("secarSeleccionado").setAttribute('style','display:none;');
    return false;
}

function quitarError(){
    document.getElementById('todo').removeAttribute('style');
    document.getElementById('berror').setAttribute('style','display:none;');
}
function errorPuerta(){
    document.getElementById('todo').setAttribute('style', 'display:none;');
    document.getElementById('berror').removeAttribute('style');

    let html ="";
    html+= '<p id="errorPuertaAbierta">Cierre la puerta</p>';
    document.getElementById('berror').innerHTML = html;

    setTimeout(quitarError,2000);
}
function errorRopa(){
    document.getElementById('todo').setAttribute('style', 'display:none;');
    document.getElementById('berror').removeAttribute('style');

    let html ="";
    html+= '<p id="errorPuertaAbierta">No hay ropa</p>';
    document.getElementById('berror').innerHTML = html;

    setTimeout(quitarError,2000);
}

function errorDetergente(){
    document.getElementById('todo').setAttribute('style', 'display:none;');
    document.getElementById('berror').removeAttribute('style');

    let html ="";
    html+= '<p id="errorPuertaAbierta">Detergente insuficiente</p>';
    document.getElementById('berror').innerHTML = html;

    setTimeout(quitarError,2000);
}
function errorSuavizante(){
    document.getElementById('todo').setAttribute('style', 'display:none;');
    document.getElementById('berror').removeAttribute('style');

    let html ="";
    html+= '<p id="errorPuertaAbierta">Suavizante insuficiente</p>';
    document.getElementById('berror').innerHTML = html;

    setTimeout(quitarError,2000);
}

function errorFiltro(){
    document.getElementById('todo').setAttribute('style', 'display:none;');
    document.getElementById('berror').removeAttribute('style');

    let html ="";
    html+= '<p id="errorPuertaAbierta">Filtro obstruido</p>';
    document.getElementById('berror').innerHTML = html;

    setTimeout(quitarError,2000);
}

function cambioALavando(){
    if (lavadoraPuesta == true && secadoraPuesta == true){ //ambas cosas puestas
        document.getElementById("todo").setAttribute('style','display:none;');
        document.getElementById("enproceso").removeAttribute('style');
        tiempoGlobal = tiempoLavado + tiempoSecado; //120 60 -> 180
        document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
        document.getElementById("barracentral").style.borderTop="4px solid var(--colorGrisApagado)";
        document.getElementById("circuloSecado").style.color="var(--colorGrisApagado)";
        document.getElementById("tiempo1").innerHTML=Math.trunc(tiempoLavado/60)+":"+tiempoLavado%60+"h";
        document.getElementById("tiempo2").innerHTML=Math.trunc(tiempoSecado/60)+":"+tiempoSecado%60+"h";

    }else if(lavadoraPuesta == true && secadoraPuesta == false){//solo lavadora
        document.getElementById("todo").setAttribute('style','display:none;');
        document.getElementById("enproceso").removeAttribute('style');
        tiempoSecado =0 ;
        tiempoGlobal = tiempoLavado + tiempoSecado; //120 60 -> 180
        document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
        document.getElementById("tiempo1").innerHTML=Math.trunc(tiempoLavado/60)+":"+tiempoLavado%60+"h";
        document.getElementById("tiempo2").setAttribute('style', 'display:none;');
        document.getElementById("barracentral").setAttribute('style', 'display:none;');
        document.getElementById("circuloSecado").setAttribute('style', 'display:none;');
        document.getElementById("p-textoProgramas").setAttribute('style', 'display:none;');

        document.getElementById("conjunto").style.marginLeft ="300px";

    }else if(lavadoraPuesta == false && secadoraPuesta == true){
        document.getElementById("todo").setAttribute('style','display:none;');
        document.getElementById("enproceso").removeAttribute('style');
        tiempoLavado =0 ;
        tiempoGlobal = tiempoLavado + tiempoSecado; //120 60 -> 180
        document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
        document.getElementById("tiempo2").innerHTML=Math.trunc(tiempoSecado/60)+":"+tiempoSecado%60+"h";
        document.getElementById("tiempo1").setAttribute('style', 'display:none;');
        document.getElementById("barracentral").setAttribute('style', 'display:none;');
        document.getElementById("circuloLavado").setAttribute('style', 'display:none;');
        document.getElementById("p-textoProgramas1").setAttribute('style', 'display:none;');
        document.getElementById("circuloSecado").style.textAlign = "center";
        document.getElementById("conjunto").style.marginLeft ="325px";
        document.getElementById("tiempo2").style.marginLeft ="12px";
        document.getElementById("circuloSecado").style.marginLeft ="70px";
    }
}

//setTimeout(controlTemperatura,500);

/*21:43:00   21:45:37
2 h y 30 minutos -->

*/
function lavar() {
    
    //console.log("Temperatura:"+electro.temperaturaAgua+" | Valor:"+temperaturaLavado);
    // Puerta abierta
    
    if (electro.puertaAbierta) {
        errorPuerta();
        return;
    }
    //compruebo si hay ropa
    if (!electro.peso) {
        errorRopa();
        return;
    }
    //compruebo si hay suficiente detergente
    if (electro.nivelDetergente<detergenteLavado){
        errorDetergente();
        return;
    }
    //compruebo si hay suavizante suficiente
    if (electro.nivelSuavizante<suavizanteLavado){
        errorSuavizante();
        return;
    }
    //compruebo el filtro
    if(electro.filtroObstruido){
        errorFiltro();
        return;
    }
    
    if (lavadoraPuesta == true){
        document.getElementById("conjunto").removeAttribute('style');
        document.getElementById("circuloLavado").removeAttribute('style');
        document.getElementById("circuloSecado").removeAttribute('style');
        document.getElementById("barracentral").removeAttribute('style');
        document.getElementById("p-textoProgramas1").removeAttribute('style');
        document.getElementById("p-textoProgramas").removeAttribute('style');
        document.getElementById("tiempo1").removeAttribute('style');
        document.getElementById("tiempo2").removeAttribute('style');
        document.getElementById("botonPause").removeAttribute('style');
        document.getElementById("botonEnd").setAttribute('style', 'display:none;');
        document.getElementById("barracentral").style.borderTop="4px solid var(--colorGrisApagado)";
        document.getElementById("circuloSecado").style.color="var(--colorGrisApagado)";
        cambioALavando();
        console.log("Iniciar lavado");
        electro.desague = false;
        electro.puertaBloqueada = true; // Bloquear puerta durante el lavado
        console.log("Puerta bloqueada");
        // Llenar de agua el tambor (para lavado)
        console.log("Llenar de agua (para lavado)...")
        llenar("nivelAgua", "tomaAgua", 80, function () {
            tempL=true; //control de temperatura
            // Detergente
            console.log("Poner detergente...");
            tiempoGlobal -= tiempoLavado/6;
            document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
            vaciar("nivelDetergente", "tomaDetergente", electro.nivelDetergente - detergenteLavado, function () {
                // Lavado
                console.log("Lavar...")
                tiempoGlobal -= tiempoLavado/6;
                document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
                electro.tamborRevoluciones = revolucionesLavado;
                termostato("temperaturaAgua", "resistenciaAgua", temperaturaLavado, tiempoLavado*100, function () { // por 100 para que sean mas segundos 
                    // Vaciar agua
                    console.log("Vaciar tambor de agua...");
                    vaciar("nivelAgua", "desague", 0, function () {
                        // Llenar de agua para suavizante
                        console.log("Llenar de agua (para suavizante)...");
                        tiempoGlobal -= tiempoLavado/6;
                        document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";

                        llenar("nivelAgua", "tomaAgua", 80, function () {
                            // Suavizante
                            console.log("Poner suavizante");
                            tiempoGlobal -= tiempoLavado/6;
                            document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";

                            vaciar("nivelSuavizante", "tomaSuavizante", electro.nivelSuavizante - suavizanteLavado, function () {
                                // Vaciar agua
                                console.log("Vaciar tambor de agua...");
                                tempL = false;//baja temperatura
                                tiempoGlobal -= tiempoLavado/6;
                                document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";

                                vaciar("nivelAgua", "desague", 0, function () {
                                    tiempoGlobal -= tiempoLavado/6;
                                    document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
                                    /* Centrifugar
                                    console.log("Centrifugar...")
                                    electro.tamborRevoluciones = 1500;
                                    setTimeout(function () {
                                        console.log("Fin del lavado!!!");
                                        
                                    }, 7000);*/
                                    
                                    if (secadoraPuesta == true){
                                        document.getElementById("barracentral").style.borderTop="4px solid var(--colorTexto)";
                                        document.getElementById("circuloSecado").style.color="var(--colorTexto)";
                                        electro.resistenciaAire = true;
                                        electro.flujoAire = true;
                                        electro.tamborRevoluciones = revolucionesSecado;
                                        let parar = true;
                                        setTimeout(function () {

                                        //console.log("entra si que entra");
                                        if (electro.on("humedad", function () {
                                            console.log("Secando");
                                            //secar
                                            
                                            //electro.resistenciaAire = true;
                                            //console.log("temperatura aire: "+ electro.temperaturaAire);
                                            //console.log("temperatura secado: "+ temperaturaSecado);
                                            if (electro.temperaturaAire < temperaturaSecado) electro.resistenciaAire = true;
                                            if (electro.temperaturaAire > temperaturaSecado) electro.resistenciaAire = false;
                                            if(humedadSecado == 1){
                                                if(electro.humedad<=75 && parar ==true){
                                                    parar=false;
                                                    tiempoGlobal -= tiempoGlobal/2;
                                                    document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
                        
                                                }
                                                if (electro.humedad <= 50){

                                                    electro.flujoAire = false;
                                                    done = true;
                                                }
                                            }else if (humedadSecado == 2){
                                                if(electro.humedad<=65 && parar == true){
                                                    parar=false;
                                                    tiempoGlobal -= tiempoGlobal/2;
                                                    document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
                        
                                                }
                                                if (electro.humedad <= 25){

                                                    electro.flujoAire = false;
                                                    done =true;
                                                }
                                            }else if(humedadSecado == 3){
                                                if(electro.humedad<=50 && parar == true){
                                                    parar=false;
                                                    tiempoGlobal -= tiempoGlobal/2;
                                                    document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";
                        
                                                }
                                                if (electro.humedad == 0){
                                                    electro.flujoAire = false;
                                                    done = true;
                                                    console.log("done se pone true : "+done);
                                                }
                                            }
                                            if (done ==true){
                                                console.log("Secado terminado!!");
                                                console.log("Lavado terminado!!");
                                                electro.tamborRevoluciones = 0; // parar motor
                                                electro.puertaBloqueada = false; // desbloquear puerta
                                                electro.resistenciaAire = false;
                                                document.getElementById("botonPause").setAttribute('style','display:none;');
                                                document.getElementById("botonEnd").removeAttribute('style');
                                                document.getElementById("tiempoRestante").innerHTML =  "Fin";
                                            }
                                            
                                            
                                            
                                        }));
                                    
                                        if (done ==true){
                                            console.log("Secado terminado!!");
                                            console.log("Lavado terminado!!");
                                            electro.tamborRevoluciones = 0; // parar motor
                                            electro.puertaBloqueada = false; // desbloquear puerta
                                            electro.resistenciaAire = false;
                                            electro.resistenciaAgua = false;
                                            document.getElementById("tiempoRestante").innerHTML =  "Fin";
                                            document.getElementById("botonPause").setAttribute('style','display:none;');
                                            document.getElementById("botonEnd").removeAttribute('style');
                                        }
                                        }, tiempoSecado*100);
                                        
                                        /*
                                        setTimeout(function () {

                                            console.log("Secado terminado!!");
                                            console.log("Lavado terminado!!");
                                            electro.tamborRevoluciones = 0; // parar motor
                                            electro.puertaBloqueada = false; // desbloquear puerta
                                        }, tiempoSecado*100);*/
                                    }else{
                                        console.log("Lavado terminado!!");
                                        electro.tamborRevoluciones = 0; // parar motor
                                        electro.puertaBloqueada = false; // desbloquear puerta
                                        document.getElementById("tiempoRestante").innerHTML =  "Fin";
                                        document.getElementById("botonPause").setAttribute('style','display:none;');
                                        document.getElementById("botonEnd").removeAttribute('style');
                                    }
                                    
                                });
                            });
                        });
                    });
                });
            });
        });
    }else{
        
        if (secadoraPuesta == true){cambioALavando();
            //secar
            document.getElementById("barracentral").style.borderTop="4px solid var(--colorTexto)";
            document.getElementById("circuloSecado").style.color="var(--colorTexto)";
            electro.resistenciaAire = true;
            electro.flujoAire = true;
            electro.tamborRevoluciones = revolucionesSecado;
            let parar = true;
            setTimeout(function () {

            //console.log("entra si que entra");
            if (electro.on("humedad", function () {
                console.log("Secando");
                //secar
                
                //electro.resistenciaAire = true;
                //console.log("temperatura aire: "+ electro.temperaturaAire);
                //console.log("temperatura secado: "+ temperaturaSecado);
                if (electro.temperaturaAire < temperaturaSecado) electro.resistenciaAire = true;
                if (electro.temperaturaAire > temperaturaSecado) electro.resistenciaAire = false;
                if(humedadSecado == 1){
                    if(electro.humedad<=75 && parar ==true){
                        parar=false;
                        tiempoGlobal -= tiempoGlobal/2;
                        document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";

                    }
                    if (electro.humedad <= 50){

                        electro.flujoAire = false;
                        done = true;
                    }
                }else if (humedadSecado == 2){
                    if(electro.humedad<=65 && parar == true){
                        parar=false;
                        tiempoGlobal -= tiempoGlobal/2;
                        document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";

                    }
                    if (electro.humedad <= 25){

                        electro.flujoAire = false;
                        done =true;
                    }
                }else if(humedadSecado == 3){
                    if(electro.humedad<=50 && parar == true){
                        parar=false;
                        tiempoGlobal -= tiempoGlobal/2;
                        document.getElementById("tiempoRestante").innerHTML =  Math.trunc(tiempoGlobal/60)+":"+tiempoGlobal%60+"h";

                    }
                    if (electro.humedad == 0){
                        electro.flujoAire = false;
                        done = true;
                        console.log("done se pone true : "+done);
                    }
                }
                if (done ==true){
                    console.log("Secado terminado!!");
                    console.log("Lavado terminado!!");
                    electro.tamborRevoluciones = 0; // parar motor
                    electro.puertaBloqueada = false; // desbloquear puerta
                    electro.resistenciaAire = false;
                    document.getElementById("botonPause").setAttribute('style','display:none;');
                    document.getElementById("botonEnd").removeAttribute('style');
                    document.getElementById("tiempoRestante").innerHTML =  "Fin";
                }
                
                
                
            }));
        
            if (done ==true){
                console.log("Secado terminado!!");
                console.log("Lavado terminado!!");
                electro.tamborRevoluciones = 0; // parar motor
                electro.puertaBloqueada = false; // desbloquear puerta
                electro.resistenciaAire = false;
                document.getElementById("botonPause").setAttribute('style','display:none;');
                    document.getElementById("botonEnd").removeAttribute('style');
                document.getElementById("tiempoRestante").innerHTML =  "Fin";
            }
            }, tiempoSecado*100);
        }
    }
    return false;
}
//seleccion de programa de lavado
function irASecado(){
    inicio = false;
    document.getElementById("configLavado").style.marginLeft = "0";

    secado = true;
    document.getElementById("programasS").removeAttribute('style');
    document.getElementById("programasL").setAttribute('style', 'display:none;');
    document.getElementById("lavTitle").setAttribute('style', 'display:none;');
    document.getElementById("secTitle").removeAttribute('style');

    document.getElementById("divLyS").setAttribute('style','display:none');
    document.getElementById("divHeader").setAttribute('style','display:none;');
    document.getElementById("puertaAbierta").setAttribute('style','display:none;');
    document.getElementById("programaLavado").removeAttribute('style');
    if (lavadoraPuesta == true){
        seleccionSecado(numeroPrograma);
    }
    return false;

}
function seleccionSecado(programa){
    dondeEstoy =2;
    switch (programa) {
        case 0://sinteticos
            tiempoSecado = 60;
            temperaturaSecado=50;
            revolucionesSecado = 600;
            humedadSecado =3;
            nombProgramaSecado="Sintéticos";
            arrayFavSecado[0]++;
            document.getElementById("ps0").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Sintéticos';
            break;
        case 1://delicados
            tiempoSecado = 20;
            temperaturaSecado=50;
            revolucionesSecado = 200;
            humedadSecado =3;
            nombProgramaSecado="Delicados";
            arrayFavSecado[1]++;
            document.getElementById("ps1").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Delicados';
            break;
        case 2://algodon
            tiempoSecado = 30;
            temperaturaSecado=40;
            revolucionesSecado = 500;
            humedadSecado =3;
            nombProgramaSecado="Algodón";
            arrayFavSecado[2]++;
            document.getElementById("ps2").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Algodón';
            break;
        case 3://tejidos gruesos
            tiempoSecado = 120;
            temperaturaSecado=60;
            revolucionesSecado = 1000;
            humedadSecado =3;
            nombProgramaSecado="Tejidos Gruesos";
            arrayFavSecado[3]++;
            document.getElementById("ps3").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Tejidos Gruesos';
            break;
        case 4://quita manchas
            tiempoSecado = 60;
            temperaturaSecado=50;
            revolucionesSecado = 800;
            humedadSecado =3;
            nombProgramaSecado="Quita Manchas";
            arrayFavSecado[4]++;
            document.getElementById("ps4").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Quita Manchas';
            break;
        case 5://rapido
            tiempoSecado = 20;
            temperaturaSecado=60;
            revolucionesSecado = 1200;
            humedadSecado =3;
            nombProgramaSecado="Rápido";
            arrayFavSecado[5]++;
            document.getElementById("ps5").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Rápido';
            break;
        case 6://centrifugado
            tiempoSecado = 20;
            temperaturaSecado=40;
            revolucionesSecado = 1000;
            humedadSecado =3;
            nombProgramaSecado="Para Planchar";
            arrayFavSecado[6]++;
            document.getElementById("ps6").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Para Planchar';
            break;
        case 7://silencioso
            tiempoSecado = 130;
            temperaturaSecado=40;
            revolucionesSecado = 300;
            humedadSecado =3;
            nombProgramaSecado="Silencioso";
            arrayFavSecado[7]++;
            document.getElementById("ps7").innerHTML ='<i class="fas fa-circle" style="vertical-align: middle; margin-left: -40px;margin-right: 10px; font-size: 15px;" ></i> Silencioso';
            break;
        default:
            break;
    }
    //coloco los valores de cada programa
    document.getElementById("temperaturaOpt2").innerHTML= temperaturaSecado + "ºC";
    document.getElementById("tiempoOpt2").innerHTML =Math.trunc(tiempoSecado/60)+":"+tiempoSecado%60+"h";
    document.getElementById("humedad2").innerHTML = "Humedad"+'<i class="far fa-sun"></i><i class="far fa-sun"></i><i class="far fa-sun"></i>';
    document.getElementById("antiarrugas2").innerHTML = "AntiArrugas"+'<i class="far fa-circle"></i>';


    console.log("Tiempo: "+Math.trunc(tiempoSecado/60)+":"+tiempoSecado%60+"h");
    console.log("Temperatura: "+temperaturaSecado+"ºC");
    console.log("Revoluciones: "+revolucionesSecado+" rpm");
    console.log("Nombre: "+nombProgramaSecado);

    
    document.getElementById("programasS").style.borderRight="2px solid var(--colorTexto)";
    document.getElementById("configSecado2").removeAttribute('style');
    document.getElementById("configSecado2").style.width = "30%";
    document.getElementById("configLavado").style.transition = "0.5s";
    document.getElementById("configLavado").style.marginLeft = "-150px";
    document.getElementById("siguientePaso").removeAttribute('style');

    quitarSeleccionadosSecado(programa); //quito posibles selecciones anteriores
    return false;
}



function quitarSeleccionadosSecado(valor){
   
    let html = "";
    if (valor !=0){
        html =" Sintéticos";
        document.getElementById("ps0").innerHTML =html;
    }
    if (valor != 1){
        html =" Delicados";
        document.getElementById("ps1").innerHTML =html;
    }
    if (valor != 2){
        html = " Algodón";
        document.getElementById("ps2").innerHTML =html;
    }
    if (valor != 3){
        html =" Tejidos Gruesos";
        document.getElementById("ps3").innerHTML =html;
    }
    if (valor != 4){
        html=" Quita Manchas";
        document.getElementById("ps4").innerHTML =html;
    }
    if (valor != 5){
        html = " Rápido";
        document.getElementById("ps5").innerHTML =html;
    }
    if (valor != 6){
        html = " Centrifugado";
        document.getElementById("ps6").innerHTML =html;
    }
    if (valor != 7){
        html=" Silencioso"
        document.getElementById("ps7").innerHTML =html;
    }
    return false;
}


function opcSecadoTemp(){
    document.getElementById("configSecado2").setAttribute('style','display:none;');
    document.getElementById("tempSelect2").removeAttribute('style');
    return false;
}
function cambioTempSecado(valor){
    temperaturaSecado = valor;
    document.getElementById("tempSelect2").setAttribute('style','display:none;');
    document.getElementById("configSecado2").removeAttribute('style');
    document.getElementById("temperaturaOpt2").innerHTML = temperaturaSecado + "ºC";
    return false;
}



function opcSecadoTime(){
    document.getElementById("configSecado2").setAttribute('style','display:none;');
    document.getElementById("timeSelect2").removeAttribute('style');
    return false;
}
function cambioTimeSecado(valor){
    tiempoSecado = valor;
    document.getElementById("timeSelect2").setAttribute('style','display:none;');
    document.getElementById("configSecado2").removeAttribute('style');
    document.getElementById("tiempoOpt2").innerHTML = Math.trunc(valor/60)+":"+valor%60+"h";
    return false;
}
function opcSecadoHum(){
    document.getElementById("configSecado2").setAttribute('style','display:none;');
    document.getElementById("humSelect2").removeAttribute('style');
}

function cambioHumSecado(valor){
    
    if(valor == 1){
        document.getElementById("humedad2").innerHTML = 'Humedad <i class="far fa-sun"></i>';
        humedadSecado =1;
    }else if (valor == 2){
        humedadSecado =2;
        document.getElementById("humedad2").innerHTML = 'Humedad <i class="far fa-sun"></i><i class="far fa-sun"></i>';
    }else{
        humedadSecado =3;
        document.getElementById("humedad2").innerHTML = 'Humedad <i class="far fa-sun"></i><i class="far fa-sun"></i><i class="far fa-sun"></i>';
    }
    document.getElementById("humSelect2").setAttribute('style','display:none;');
    document.getElementById("configSecado2").removeAttribute('style');
    //document.getElementById("humedad2").innerHTML = humedadSecado;
    return false;
}

function antiarrugasActivado(){
    let html="";
    if (antiarrugado ==false){
        antiarrugado =true;
        html +="AntiArrugas"+'<i class="far fa-circle"></i>';
        document.getElementById("antiarrugas2").innerHTML = html;
    }else{
        antiarrugado =false;
        html +="AntiArrugas"+'<i class="fas fa-circle"></i>';
        document.getElementById("antiarrugas2").innerHTML = html;
    }
    
    return false;
}

function cortarProceso(){
    volverAinicio();
    electro.tamborRevoluciones = 0;
    electro.resistenciaAgua =false;
    electro.resistenciaAire = false;
    electro.flujoAire = false;
    electro.tomaAgua = false;
    electro.desague = true;
    electro.puertaBloqueada = false;

    return false;
}


