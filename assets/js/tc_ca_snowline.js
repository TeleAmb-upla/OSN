import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function tc_ca_snowline() {

    const margin = { top: 10, right: 0, bottom: 40, left: 10 };
    const width = 160 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Si el ancho de la ventana es <= 768px, usará el contenedor móvil, de lo contrario el de escritorio.
    const containerId = window.innerWidth <= 767 ? "#p06-mob" : "#p06-desk";
  // Crear un nuevo SVG y agregarlo al cuerpo del documento
  const svg = d3.select(containerId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "d3-plot")
        .append("g")
        .attr("transform", "translate(0," + margin.top + ")");

    // Creación del tooltip
       var tooltip = d3.select(containerId)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");

    const data = await d3.csv("../assets/csv/total/MCD_tc_ca_snowline.csv");

    const y = d3.scaleBand()
        .rangeRound([0, height], .3)
        .paddingInner(0.1) // Agrega un pequeño espacio entre las bandas
        .paddingOuter(0.2); // Agrega espacio adicional en los bordes del eje Y

    const x = d3.scaleLinear()
        .rangeRound([15, width]);

    const color = d3.scaleOrdinal() // Escala de colores
                .range(["#086fad", "#f6a580", "#cccccc", "#92c6db", "#c7001e"]);

    color.domain(["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"]);

    const xAxis = d3.axisBottom(x)
    .ticks(5)
    .tickFormat(function(d) { return d*(1); });

    const yAxis = d3.axisLeft(y).tickFormat(function (d) { return ''; });

    data.forEach(function(d) {
        d["Strongly disagree"] = +d[1];
        d["Disagree"] = +d[2];
        d["Neither agree nor disagree"] = +d[3];
        d["Agree"] = +d[4];
        d["Strongly agree"] = +d[5];
        let x0 = -1*(d["Neither agree nor disagree"]/2+d["Disagree"]+d["Strongly disagree"]);
        let idx = 0;
        d.boxes = color.domain().map(function(name) {
            return { name: name, x0: x0, x1: x0 += +d[name], N: +d.N, n: +d[idx += 1], data: d };
        });
    });

    const min_val = d3.min(data, function(d) {
        return d.boxes["0"].x0;
    });

    const max_val = d3.max(data, function(d) {
        return d.boxes["4"].x1;
    });

    x.domain([min_val, max_val]).nice();
  
    y.domain(data.map(function(d) { return d.Question; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    const vakken = svg.selectAll(".question")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + y(d.Question) + ")"; });

    const bars = vakken.selectAll("rect")
        .data(function(d) { return d.boxes; })
        .enter().append("g").attr("class", "subbar");

    bars.append("rect")
        .attr("height", y.bandwidth()* 1) // "sombra a las barras
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x1) - x(d.x0); })
        .style("fill", function(d) { return color(d.name); })
        .on("mouseover", function(d) {
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1);
        })
        .on("mousemove", function(event, d) {
            let cobertura = -(d.data["1"] ? parseFloat(d.data["1"]) : 0) + (d.data["5"] ? parseFloat(d.data["5"]) : 0);
            tooltip
                .html("Cuenca: " + d.data.Question + "<br>" + 
                      "Cambio linea de nieve: " + Math.round(cobertura) + " m"
                      )
                .style("left", (event.pageX + 30) + "px")
                .style("top", (event.pageY + 30) + "px");
        })
        .on("mouseout", function(d) {
            tooltip
                .style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        });

    vakken.insert("rect", ":first-child")
        .attr("height", y.bandwidth())
        .attr("x", "1")
        .attr("width", width)
        .attr("fill-opacity", "0.5")
        .style("fill", "#F5F5F5")
        .attr("class", function(d,index) { return index % 2 == 0 ? "even" : "uneven"; });

// Linea que diferencia entre cuencas 
// Añade este array de configuración al inicio de tu función (después de definir margin):
// Función para generar IDs en un rango (formato 3 dígitos)
function generateIDRange(startNum, endNum, color, position) {
    const ids = [];
    for (let i = startNum; i <= endNum; i++) {
        ids.push({
            id: i.toString().padStart(3, '0'), // Formatea a 3 dígitos
            color: color,
            position: position
        });
    }
    return ids;
}

// Configuración de todos los rangos
const specialQuestions = [
    // Rango 010-047 (Amarillo mostaza - derecha)
    ...generateIDRange(10, 47, "#FFD37F", "right"),
    
    // Rango 051-073 (Amarillo brillante - derecha)
    ...generateIDRange(51, 73, "#FFFF73", "right"),
    
    // Rango 081-104 (Verde menta - derecha)
    ...generateIDRange(81, 104, "#BAE1A6", "right"),
    
    // Rango 105-129 (Azul claro - derecha)
    ...generateIDRange(105, 129, "#73DFFF", "right"),
];
specialQuestions.forEach(config => {
    vakken.filter(d => d.Question === config.id)
        .append("rect")
        .attr("x", x(0) - 44) //  Centrado en el eje Y (mitad del ancho de 6px)
        .attr("width", 6)
        .attr("height", y.bandwidth())
        .attr("fill", config.color)
        .style("shape-rendering", "crispEdges");
});

    svg.append("g")
        .attr("class", "y axis")
        .append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y2", height);

    svg.append("text")
    .attr("x", 30)
    .attr("y",585)
    .attr("text-anchor", "center")
    .style("font-size", "14px")
    .attr("font-family","Arial")
    .text("Línea de nieve (m)");

}
