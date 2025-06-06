import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Función para dibujar el gráfico 
export async function c_SCA_ym_elev(watershed, suffix = 'desk') {
    const margin = { top: 50, right: 80, bottom: 70, left: 80 };
    const isMobile = suffix === 'mob';
    const width = isMobile ? window.innerWidth - 30 : 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const containerId = `p18-${suffix}`;
    const container = document.getElementById(containerId);

    // Limpiar contenedor
    container.innerHTML = '';

    // Crear SVG
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", isMobile ? "100%" : width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", isMobile ? `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}` : "")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

        
        const tooltip = d3.select("#" + containerId)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")  // Asegura que el tooltip flote sobre el gráfico
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("pointer-events", "none"); // Evita que interfiera con el mouseover
    

    // Text to create .csv file
    const text_ini = "../assets/csv/yearMonth/MCD_SCA_ym_elev_BNA_";
    const text_end =  ".csv";

    // .csv file
    const watershed_selected = text_ini.concat(watershed).concat(text_end);

    // Read the data
const data = await d3.csv(watershed_selected, d => ({
    ...d,
    Elevation: Math.round(d.Elevation), // redondear a numeros enteros la elevación
    SCA: +d.SCA,
    CCA: +d.CCA,

  }));

    // Labels
    const myGroups = Array.from(new Set(data.map(d => d.Date))); // mantiene solo el primer mes de cada año
    const myVars = Array.from(new Set(data.map(d => d.Elevation)));

    // Build X scales and axis:
    const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(myGroups)
    .padding(0.05);
svg.append("g")
    .style("font-size", 10)
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(function(d) { // crea eje x
        const dateParts = d.split("-"); // divide las fechas
        const year = dateParts[0]; //extrae los años 
        const month = dateParts[1]; //extrae los meses
        const day = dateParts[2]; //extrae los dias
        if (month === "01" && day === "01") { // primer dia del primer mes
            return year; // que aparezca solo el año
        } else {
            if (month == "02" && day == "01" && year =="2000") { // primer dia del primer mes
                return year; // que aparezca solo el año
            } else {
                return "";
            }
        }
    }))
    .selectAll("line")  // selecciona todas las marcas de línea
    .attr("y2", function(d) {
        const dateParts = d.split("-"); // divide las fechas
        const year = dateParts[0]; //extrae los años 
        const month = dateParts[1]; //extrae los meses
        const day = dateParts[2]; //extrae los dias
        if ((month === "01" && day === "01") || (month == "02" && day == "01" && year =="2000")) { // primer dia del primer mes
            return 8; // que la línea sea más larga
        } else {
            return 4; // que la línea sea más corta
        }
    });


    // Build Y scales and axis:
    const y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(myVars)
        .padding(0.05);
    const yAxis = d3.axisLeft(y)
        .tickValues(y.domain().filter(function(d,i){ return !(i%5)}));
    const gX = svg.append("g").call(yAxis);
  
    const colorScaleThreshold = d3
        .scaleThreshold()
        .domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
        .range(["#FFFFE6", "#FFFFB4", "#FFEBBE", "#FFD37F", "#FFAA00", "#E69800", "#70A800", "#00A884", "#0084A8", "#004C99"])



// Tres funciones que cambian la información sobre herramientas cuando el usuario pasa el cursor/mueve/sale de una celda
var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function (event, d) {
    var SCA = Number(d.SCA); // Convertir cadena a número
    var dateComponents = d.Date.split("-"); // Dividir la fecha
    var yearMonth = dateComponents[0] + "-" + dateComponents[1]; // Reconstruir la fecha
    var CCA = Number(d.CCA); // era una cadena y habla que pasarla a numero
    tooltip
        .html( "Fecha: " + yearMonth + "<br>" 
              + "Elevación: " + d.Elevation +  " (msnm)" + "<br>" 
              + "Cobertura: " + SCA.toFixed(1) + " %" + "<br>"  // Definir cantidad de decimales
              + "Nube: " + CCA.toFixed(1) + " %" 
            )
        .style("left", (event.pageX + 30) + "px") 
        .style("top", (event.pageY - 28) + "px")  // Ajustar posición para evitar solapamiento
  }
  
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }






// Add the squares
svg.selectAll()
  .data(data, function (d) { return d.Date + ':' + d.Elevation; })
  .enter()
  .append("rect")
  .attr("class", "graph-rect") // Agrega esta línea para asignar la clase
  .attr("x", function (d) { return x(d.Date); })
  .attr("y", function (d) { return y(d.Elevation); })
  .attr("width", x.bandwidth())
  .attr("height", y.bandwidth())
  .style("fill", function (d) { return colorScaleThreshold(d.SCA); })
  .style("stroke-width", 4)
  .style("stroke", "none")
  .style("opacity", 0.8)
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave);



// Coordenadas donde quieres el slider (ajústalas)
const sliderX = 280; // Ejemplo: centro horizontal
const sliderY = 320; // Ejemplo: debajo del gráfico

// Contenedor del slider
const sliderGroup = svg.append("foreignObject")
    .attr("x", sliderX)
    .attr("y", sliderY)
    .attr("width", 320)
    .attr("height", 50);

sliderGroup.append("xhtml:div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "10px")
    .html(`
        <input type="range" id="ccaSlider4" min="0" max="100" value="30" style="width: 150px">
        <span id="sliderLabel4" style="font-family: Arial; font-size: 14px;">Nubosidad > : 30%</span>
        <div style="width: 15px; height: 15px; background: black; border: 1px solid #999"></div>
    `);

// Función de actualización
function updateGraph() {
    const sliderValue = +d3.select("#ccaSlider4").property("value");
    d3.select("#sliderLabel4").text(`Nubosidad > : ${sliderValue}%`);  
    
    svg.selectAll(".graph-rect") // Usar clase específica
        .style("fill", d => (d.CCA > sliderValue) ? "black" : colorScaleThreshold(d.SCA));
}

// Ejecutar al inicio
updateGraph(); // <--- ¡Clave para inicializar!

// Evento del slider
d3.select("#ccaSlider4").on("input", updateGraph);


   // Add title to graph
   // Etiqueta title
   svg.append("text")
   .attr("text-anchor", "center")
   .attr("font-family", "Arial")
   .attr("font-size", "20px")
   .attr("x", 200)
   .attr("y", -35)
   .text("14. Cobertura de nieve promedio por año, mes y elevación");

   // Etiqueta SUb titulo
svg.append("text")
   .attr("text-anchor", "center")
   .attr("font-family", "Arial")
   .attr("font-size", "16px")
   .style("fill", "grey")
   .attr("x", 232)
   .attr("y", -15)
   .text("Cuenca: "+ watershed);

// Etiqueta del eje X
svg.append("text")
   .attr("text-anchor", "end")
   .attr("font-family", "Arial")
   .attr("font-size", "13")
   .attr("x", width / 2 + 15)
   .attr("y", height + 40)
   .text("Año-Mes");

// Etiqueta del eje Y
svg.append("text")
   .attr("text-anchor", "end")
   .attr("font-family", "Arial")
   .attr("font-size", "13")
   .attr("transform", "rotate(-90)")
   .attr("y", -40)
   .attr("x", -80)
   .text("Elevación (msnm)  ");



  // Legend
  const legendGroup = svg.append("g")
  const legX = isMobile ? width - 0 : 850; 
  const legY = isMobile ? 20 : 80;



  legendGroup.append("text")
  .attr("x", legX)
  .attr("y", legY-15)
  .text("Nieve (%)")
  .style("font-size", "12px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#004C99")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+15)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#0084A8")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+30)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#00A884")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+45)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#70A800")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+60)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#E69800")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+75)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFAA00")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+90)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFD37F")
  
  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+105)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFEBBE")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+120)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFFFB4")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+135)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFFFE6")


  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7)
  .text("90 - 100")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15)
  .text("80 - 90")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15)
  .text("70 - 80")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15)
  .text("60 - 70")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15)
  .text("50 - 60")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15)
  .text("40 - 50")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15)
  .text("30 - 40")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15+15)
  .text("20 - 30")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15+15+15)
  .text("10 - 20")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15+15+15+15)
  .text("0 - 10")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")




        
// Crear un botón de exportación dentro del SVG
var button = svg.append("foreignObject")
    .attr("width", 30) // ancho del botón
    .attr("height", 40) // alto del botón
    .attr("x", width - 25) // posiciona el botón en el eje x
    .attr("y",-48) // posiciona el botón en el eje Y
    .append("xhtml:body")
    .html('<button type="button" style="width:100%; height:100%; border: 0px; border-radius:5px; background-color: transparent;"><img src="../assets/img/descarga.png" alt="descarga" width="20" height="20"></button>')
    .on("click", function() {
        var columnNames = Object.keys(data[0]); 

        // Crea una nueva fila con los nombres de las columnas y agrega tus datos
        var csvData = [columnNames].concat(data.map(row => Object.values(row))).join("\n");
        
        var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var fileName = "MCD_SCA_ym_elev_BNA_" + watershed + ".csv";
        
        var link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
















   
}
