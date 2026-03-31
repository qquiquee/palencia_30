// Capas de estructura

module marco_vigas_recto_sobre_pletinas(nw, ne, sw, se, z_viga){
    largo_h = segmento_largo(nw, ne);
    largo_v = segmento_largo(nw, sw);

    // Las vigas largas corren completas sobre las pletinas de coronacion.
    viga_segmento_tramo(nw, ne, z_viga, -pletina_cabeza_lado/2, largo_h + pletina_cabeza_lado/2);
    viga_segmento_tramo(sw, se, z_viga, -pletina_cabeza_lado/2, largo_h + pletina_cabeza_lado/2);

    // Las vigas cortas entran a testa entre las largas, sin inglete.
    viga_segmento_tramo(nw, sw, z_viga, viga_b/2, largo_v - viga_b/2);
    viga_segmento_tramo(ne, se, z_viga, viga_b/2, largo_v - viga_b/2);
}

module capa_pilares() {
    pilarC(plataforma_grande_sw[0], plataforma_grande_sw[1], altura_grande);
    pilarC(plataforma_grande_se[0], plataforma_grande_se[1], altura_grande);
    pilarC(plataforma_grande_nw[0], plataforma_grande_nw[1], altura_grande);
    pilarC(plataforma_grande_ne[0], plataforma_grande_ne[1], altura_grande);

    // Cama: apoyos vistos y continuidad sobre la plataforma inferior.
    pilarC(p5_x, p5_y, altura_pequena);
    pilarC(p8_x, p8_y, altura_pequena);

    apoyo_corto_con_pletinas(p6_x, p6_y, z_apoyo_sup, h_apoyo_sup);
    apoyo_corto_con_pletinas(apoyo_cama_x, apoyo_cama_y, z_apoyo_sup, h_apoyo_sup);
}

module capa_vigas() {
    // Plataforma grande
    marco_vigas_recto_sobre_pletinas(
        plataforma_grande_nw,
        plataforma_grande_ne,
        plataforma_grande_sw,
        plataforma_grande_se,
        z_viga_grande
    );

    // Cama/plataforma superior ajustada al perimetro real.
    marco_vigas_recto_sobre_pletinas(
        cama_nw,
        cama_ne,
        cama_sw,
        cama_se,
        z_viga_pequena
    );
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
