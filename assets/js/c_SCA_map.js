import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Función para dibujar el gráfico 
export async function c_SCA_map(watershed) {
          
    // Text to create .png file
    const text_ini = "../assets/img/map_SP_BNA/map_SP_BNA_";
    const text_end = ".png";

    // .png file
    const watershed_selected = text_ini.concat(watershed).concat(text_end);
    const img = document.createElement("img") ;

    // Mantén la relación de aspecto original
    const originalWidth = '760px';
    const originalHeight = '527px';
    const targetWidth = '450px';
    const scaleFactor = targetWidth / originalWidth;
    const targetHeight = originalHeight * scaleFactor;

    img.setAttribute('height', targetHeight);
    img.setAttribute('width', targetWidth );
    img.src = watershed_selected;
    const src = document.getElementById("p02");
    src.appendChild(img);
}
