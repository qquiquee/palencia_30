// Modulos especificos de cocina

module mueble_bajo_rect(x_ini, x_fin, y_ini, y_fin, z0, h_cuerpo, esp_encimera){
    color([0.82,0.82,0.80])
        translate([x_ini, y_ini, z0])
            cube([x_fin - x_ini, y_fin - y_ini, h_cuerpo]);

    color([0.96,0.96,0.95])
        translate([x_ini, y_ini, z0 + h_cuerpo])
            cube([x_fin - x_ini, y_fin - y_ini, esp_encimera]);
}

module mueble_alto_rect(x_ini, x_fin, y_ini, y_fin, z0, h_cuerpo){
    color([0.96,0.96,0.95])
        translate([x_ini, y_ini, z0])
            cube([x_fin - x_ini, y_fin - y_ini, h_cuerpo]);
}

module columna_cocina_rect(x_ini, x_fin, y_ini, y_fin, z0, h_total){
    color([0.95,0.95,0.94])
        translate([x_ini, y_ini, z0])
            cube([x_fin - x_ini, y_fin - y_ini, h_total]);
}

module electrodomestico_frontal(x_ini, x_fin, y_ini, y_fin, z0, h_total, col=[0.93,0.93,0.93]){
    margen = 20;
    color(col)
        translate([x_ini + margen, y_ini + margen, z0])
            cube([
                (x_fin - x_ini) - 2*margen,
                (y_fin - y_ini) - 2*margen,
                h_total
            ]);
}

module placa_encimera(x_ini, x_fin, y_ini, y_fin, z0){
    color([0.08,0.08,0.08])
        translate([x_ini, y_ini, z0])
            cube([x_fin - x_ini, y_fin - y_ini, 8]);
}

module fregadero_encimera(x_ini, x_fin, y_ini, y_fin, z0){
    color([0.70,0.72,0.74])
        translate([x_ini, y_ini, z0])
            cube([x_fin - x_ini, y_fin - y_ini, 12]);
}
