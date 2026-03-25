// Capas de despacho

module silla_despacho(x, y, z0, ang=0) {
    color([0.78, 0.80, 0.82])
        translate([x, y, z0])
            rotate([0, 0, ang]) {
                translate([-220, -220, 0])
                    cube([440, 440, 40]);

                translate([-200, 140, 40])
                    cube([400, 40, 420]);

                for (sx = [-1, 1], sy = [-1, 1])
                    translate([sx * 170 - 12, sy * 170 - 12, -420])
                        cube([24, 24, 420]);
            }
}

module capa_despacho() {
    z_mesa = z_suelo_grande + despacho_alto_tablero;
    recorte_a = desk_p1_in;
    recorte_b = punto_en_segmento(desk_p1_in, desk_p0_in, 800);
    recorte_d = punto_en_segmento(desk_p1_in, desk_p1, 300);
    recorte_c = [
        recorte_b[0] + (recorte_d[0] - recorte_a[0]),
        recorte_b[1] + (recorte_d[1] - recorte_a[1])
    ];
    silla_pos_base = interpola_punto(
        interpola_punto(desk_p0, desk_p1, 0.52),
        interpola_punto(desk_p0_in, desk_p1_in, 0.52),
        0.38
    );
    silla_pos_fondo = punto_en_segmento(silla_pos_base, interpola_punto(desk_p0_in, desk_p1_in, 0.52), 700);
    silla_pos = punto_en_segmento(silla_pos_fondo, interpola_punto(desk_p0_in, desk_p1_in, 0.80), 300);

    // Tablero simple del despacho.
    color([0.80, 0.82, 0.84])
        translate([0, 0, z_mesa])
            linear_extrude(height=tablero_esp)
                difference() {
                    polygon([desk_p0, desk_p1, desk_p1_in, desk_p0_in]);
                    polygon([recorte_a, recorte_b, recorte_c, recorte_d]);
                }

    silla_despacho(silla_pos[0], silla_pos[1], z_suelo_grande + 430, -90);
}
