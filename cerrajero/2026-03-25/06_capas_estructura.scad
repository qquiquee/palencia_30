// Capas de estructura

module capa_pilares() {
    pilarC(plataforma_grande_sw[0], plataforma_grande_sw[1], altura_grande);
    pilarC(plataforma_grande_nw[0], esc_recta_y_llegada, altura_grande);
    pilarC(esc_recta_x_fin + estructura_retranqueo_muro/2, plataforma_grande_sw[1], altura_grande);
    pilarC(hueco_esc_x_max,   hueco_esc_y_max, altura_grande);
    pilarC(pb_muro_inf_x,     pb_muro_inf_y, altura_grande);
    pilarC(pb_muro_sup_x,     pb_muro_sup_y, altura_grande);
    pilarC((plataforma_grande_sw[0] + plataforma_grande_se[0])/2, plataforma_grande_sw[1], altura_grande);

    // Cama: tres apoyos en pared y un apoyo interior visto.
    pilarC(p5_x, p5_y, altura_pequena);
    pilarC(p6_x, p6_y, altura_pequena);
    pilarC(p8_x, p8_y, altura_pequena);

    pilar_sin_baseC(p9_x, p9_y, z_apoyo_sup, h_apoyo_sup);
    pilar_sin_baseC(cama_sw[0] + 180, cama_sw[1] - 120, z_apoyo_sup, h_apoyo_sup);
}

module capa_vigas() {
    // Plataforma grande
    viga_segmento(plataforma_grande_sw, plataforma_grande_se, z_viga_grande);
    viga_segmento(plataforma_grande_nw, plataforma_grande_ne, z_viga_grande);
    vigaXc(hueco_esc_x_min, hueco_esc_x_max, hueco_esc_y_max, z_viga_grande);

    vigaYc(plataforma_grande_sw[0], plataforma_grande_sw[1], plataforma_grande_nw[1], z_viga_grande);
    vigaYc(hueco_esc_x_max + estructura_retranqueo_muro/2, plataforma_grande_sw[1], hueco_esc_y_max, z_viga_grande);
    viga_segmento(plataforma_grande_se, plataforma_grande_ne, z_viga_grande);

    vigaYc((plataforma_grande_sw[0] + plataforma_grande_se[0])/2, plataforma_grande_sw[1], plataforma_grande_nw[1], z_viga_grande);

    // Cama/plataforma superior ajustada al perimetro real.
    viga_segmento(cama_nw, cama_ne, z_viga_pequena);
    viga_segmento(cama_nw, cama_sw, z_viga_pequena);
    viga_segmento(cama_sw, cama_se, z_viga_pequena);
    viga_segmento(cama_ne, cama_se, z_viga_pequena);
    viga_segmento(cama_sw, cama_ne, z_viga_pequena);
}

module capa_secundarios() {
    // Plataforma grande
    for (ysec = [paso_sec_grande : paso_sec_grande : hueco_esc_y_max - paso_sec_grande/2])
        sec_segmento(
            [hueco_esc_x_max + estructura_retranqueo_muro/2, ysec],
            [punto_en_y(hab_pared_norte_a, hab_pared_norte_b, ysec)[0] - estructura_retranqueo_muro, ysec],
            z_sec_grande
        );

    for (ysec = [hueco_esc_y_max + paso_sec_grande : paso_sec_grande : y1_max - paso_sec_grande/2])
        sec_segmento(
            [plataforma_grande_sw[0], ysec],
            [punto_en_y(hab_pared_norte_a, hab_pared_norte_b, ysec)[0] - estructura_retranqueo_muro, ysec],
            z_sec_grande
        );

    // Cama/plataforma superior
    for (t = [0.25, 0.5, 0.75])
        sec_segmento(
            interpola_punto(cama_nw, cama_sw, t),
            interpola_punto(cama_ne, cama_se, t),
            z_sec_pequena
        );
}

module capa_tableros() {
    tablero_poligonal([plataforma_grande_sw, plataforma_grande_hueco_sw, plataforma_grande_der_sw, plataforma_grande_se], z_sup_grande);
    tablero_poligonal([plataforma_grande_hueco_nw, plataforma_grande_nw, plataforma_grande_ne, plataforma_grande_der_nw], z_sup_grande);
    tablero_poligonal([plataforma_grande_hueco_sw, plataforma_grande_hueco_nw, plataforma_grande_der_nw, plataforma_grande_der_sw], z_sup_grande);
    tablero_poligonal([cama_nw, cama_sw, cama_se, cama_ne], z_sup_pequena);
}

module capa_laminados() {
    laminado_poligonal([plataforma_grande_sw, plataforma_grande_hueco_sw, plataforma_grande_der_sw, plataforma_grande_se], z_sup_grande + tablero_esp);
    laminado_poligonal([plataforma_grande_hueco_nw, plataforma_grande_nw, plataforma_grande_ne, plataforma_grande_der_nw], z_sup_grande + tablero_esp);
    laminado_poligonal([plataforma_grande_hueco_sw, plataforma_grande_hueco_nw, plataforma_grande_der_nw, plataforma_grande_der_sw], z_sup_grande + tablero_esp);
    laminado_poligonal([cama_nw, cama_sw, cama_se, cama_ne], z_sup_pequena + tablero_esp);
}

module capa_suelo() {
    capa_tableros();
    capa_laminados();
}
