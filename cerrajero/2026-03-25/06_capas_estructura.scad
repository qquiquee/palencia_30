// Capas de estructura

module capa_pilares() {
    pilarC(plataforma_grande_sw[0], plataforma_grande_sw[1], altura_grande);
    pilarC(plataforma_grande_se[0], plataforma_grande_se[1], altura_grande);
    pilarC(plataforma_grande_nw[0], plataforma_grande_nw[1], altura_grande);
    pilarC(plataforma_grande_ne[0], plataforma_grande_ne[1], altura_grande);

    // Cama: apoyos vistos y continuidad sobre la plataforma inferior.
    pilarC(p5_x, p5_y, altura_pequena);
    pilarC(p8_x, p8_y, altura_pequena);

    pilar_sin_baseC(p6_x, p6_y, z_apoyo_sup, h_apoyo_sup);
    pilar_sin_baseC(p9_x, p9_y, z_apoyo_sup, h_apoyo_sup);
    pilar_sin_baseC(cama_sw[0] + 180, cama_sw[1] - 120, z_apoyo_sup, h_apoyo_sup);
}

module capa_vigas() {
    // Plataforma grande
    viga_segmento(plataforma_grande_sw, plataforma_grande_se, z_viga_grande);
    viga_segmento(plataforma_grande_nw, plataforma_grande_ne, z_viga_grande);
    viga_segmento(plataforma_grande_sw, plataforma_grande_nw, z_viga_grande);
    viga_segmento(plataforma_grande_se, plataforma_grande_ne, z_viga_grande);

    // Cama/plataforma superior ajustada al perimetro real.
    viga_segmento(cama_nw, cama_ne, z_viga_pequena);
    viga_segmento(cama_nw, cama_sw, z_viga_pequena);
    viga_segmento(cama_sw, cama_se, z_viga_pequena);
    viga_segmento(cama_ne, cama_se, z_viga_pequena);
    viga_segmento(cama_sw, cama_ne, z_viga_pequena);
}

module capa_secundarios() {
    // Plataforma grande
    for (t = [0.33, 0.66])
        sec_segmento(
            interpola_punto(plataforma_grande_sw, plataforma_grande_nw, t),
            interpola_punto(plataforma_grande_se, plataforma_grande_ne, t),
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
    tablero_poligonal([plataforma_grande_sw, plataforma_grande_se, plataforma_grande_ne, plataforma_grande_nw], z_sup_grande);
    tablero_poligonal([cama_nw, cama_sw, cama_se, cama_ne], z_sup_pequena);
}

module capa_laminados() {
    laminado_poligonal([plataforma_grande_sw, plataforma_grande_se, plataforma_grande_ne, plataforma_grande_nw], z_sup_grande + tablero_esp);
    laminado_poligonal([cama_nw, cama_sw, cama_se, cama_ne], z_sup_pequena + tablero_esp);
}

module capa_suelo() {
    capa_tableros();
    capa_laminados();
}
