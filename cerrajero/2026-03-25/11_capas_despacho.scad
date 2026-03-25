// Capas de despacho

module capa_despacho() {
    z_mesa = z_suelo_grande + despacho_alto_tablero;
    recorte_a = desk_p1_in;
    recorte_b = punto_en_segmento(desk_p1_in, desk_p0_in, 800);
    recorte_d = punto_en_segmento(desk_p1_in, desk_p1, 300);
    recorte_c = [
        recorte_b[0] + (recorte_d[0] - recorte_a[0]),
        recorte_b[1] + (recorte_d[1] - recorte_a[1])
    ];

    // Tablero simple del despacho.
    translate([0, 0, z_mesa])
        linear_extrude(height=tablero_esp)
            difference() {
                polygon([desk_p0, desk_p1, desk_p1_in, desk_p0_in]);
                polygon([recorte_a, recorte_b, recorte_c, recorte_d]);
            }
}
