// Capas de estructura

module capa_pilares() {
    pilarC(x1_min,            y1_min, altura_grande);
    pilarC(x1_min,            esc_recta_y_llegada, altura_grande);
    pilarC(esc_recta_x_fin,   y1_min, altura_grande);
    pilarC(hueco_esc_x_max,   hueco_esc_y_max, altura_grande);
    pilarC(x1_max,            y1_min, altura_grande);
    pilarC(x1_max,            y1_max, altura_grande);
    pilarC((x1_min+x1_max)/2, y1_min, altura_grande);

    pilarC(x2_min, y2_max, altura_pequena);
    pilarC(x2_max, y2_max, altura_pequena);

    pilar_sin_baseC(x2_min, y2_min, z_apoyo_sup, h_apoyo_sup);
    pilar_sin_baseC(x2_max, y2_min, z_apoyo_sup, h_apoyo_sup);
}

module capa_vigas() {
    // Plataforma grande
    vigaXc(hueco_esc_x_max, x1_max, y1_min, z_viga_grande);
    vigaXc(x1_min, x1_max, y1_max, z_viga_grande);
    vigaXc(hueco_esc_x_min, hueco_esc_x_max, hueco_esc_y_max, z_viga_grande);

    vigaYc(x1_min, y1_min, y1_max, z_viga_grande);
    vigaYc(hueco_esc_x_max, y1_min, hueco_esc_y_max, z_viga_grande);
    vigaYc(x1_max, y1_min, y1_max, z_viga_grande);

    vigaYc((x1_min+x1_max)/2, y1_min, y1_max, z_viga_grande);

    // Plataforma pequena
    vigaXc(x2_min, x2_max, y2_min, z_viga_pequena);
    vigaXc(x2_min, x2_max, y2_max, z_viga_pequena);

    vigaYc(x2_min, y2_min, y2_max, z_viga_pequena);
    vigaYc(x2_max, y2_min, y2_max, z_viga_pequena);
}

module capa_secundarios() {
    // Plataforma grande
    for (ysec = [paso_sec_grande : paso_sec_grande : hueco_esc_y_max - paso_sec_grande/2])
        secXc(hueco_esc_x_max, x1_max, ysec, z_sec_grande);

    for (ysec = [hueco_esc_y_max + paso_sec_grande : paso_sec_grande : y1_max - paso_sec_grande/2])
        secXc(x1_min, x1_max, ysec, z_sec_grande);

    // Plataforma pequena
    for (ysec = [y2_min + paso_sec_pequena : paso_sec_pequena : y2_max - paso_sec_pequena/2])
        secXc(x2_min, x2_max, ysec, z_sec_pequena);
}

module capa_suelo() {
    tablero_rect(x1_min, x1_max, y1_min, hueco_esc_y_min, z_sup_grande);
    laminado_rect(x1_min, x1_max, y1_min, hueco_esc_y_min, z_sup_grande + tablero_esp);

    tablero_rect(hueco_esc_x_max, x1_max, y1_min, hueco_esc_y_max, z_sup_grande);
    laminado_rect(hueco_esc_x_max, x1_max, y1_min, hueco_esc_y_max, z_sup_grande + tablero_esp);

    tablero_rect(x1_min, x1_max, hueco_esc_y_max, y1_max, z_sup_grande);
    laminado_rect(x1_min, x1_max, hueco_esc_y_max, y1_max, z_sup_grande + tablero_esp);

    tablero_rect(x2_min, x2_max, y2_min, y2_max, z_sup_pequena);
    laminado_rect(x2_min, x2_max, y2_min, y2_max, z_sup_pequena + tablero_esp);
}
