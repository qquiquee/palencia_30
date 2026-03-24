// Ensamblaje general

module ensamblaje() {
    if (ver_habitacion)
        capa_habitacion();

    if (ver_pilares)
        color([0.72,0.72,0.76]) capa_pilares();

    if (ver_vigas)
        color([0.45,0.45,0.48]) capa_vigas();

    if (ver_secundarios)
        color([0.30,0.30,0.33]) capa_secundarios();

    if (ver_suelo) {
        color([0.68,0.50,0.32]) {
            tablero_rect(x1_min, x1_max, y1_min, hueco_esc_y_min, z_sup_grande);
            tablero_rect(hueco_esc_x_max, x1_max, y1_min, hueco_esc_y_max, z_sup_grande);
            tablero_rect(x1_min, x1_max, hueco_esc_y_max, y1_max, z_sup_grande);
            tablero_rect(x2_min,      x2_max, y2_min,      y2_max,      z_sup_pequena);
        }

        color([0.82,0.70,0.50]) {
            laminado_rect(x1_min, x1_max, y1_min, hueco_esc_y_min, z_sup_grande + tablero_esp);
            laminado_rect(hueco_esc_x_max, x1_max, y1_min, hueco_esc_y_max, z_sup_grande + tablero_esp);
            laminado_rect(x1_min, x1_max, hueco_esc_y_max, y1_max, z_sup_grande + tablero_esp);
            laminado_rect(x2_min,      x2_max, y2_min,      y2_max,      z_sup_pequena + tablero_esp);
        }
    }

    if (ver_cartelas)
        capa_cartelas();

    if (ver_barandilla)
        color([0.84,0.84,0.86]) capa_barandillas();

    if (ver_escalera)
        capa_escalera();

    if (ver_hueco)
        capa_hueco();

    if (ver_etiquetas_pilares)
        capa_etiquetas_pilares();

    if (ver_cotas)
        capa_cotas();
}
