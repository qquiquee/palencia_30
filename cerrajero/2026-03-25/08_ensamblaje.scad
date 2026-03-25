// Ensamblaje general

module ensamblaje() {
    if (ver_habitacion)
        capa_habitacion();

    if (ver_techo)
        capa_techo();

    if (ver_pilares)
        color([0.72,0.72,0.76]) capa_pilares();

    if (ver_vigas)
        color([0.45,0.45,0.48]) capa_vigas();

    if (ver_secundarios)
        color([0.30,0.30,0.33]) capa_secundarios();

    if (ver_suelo) {
        color([0.68,0.50,0.32]) {
            capa_tableros();
        }

        color([0.82,0.70,0.50]) {
            capa_laminados();
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

    if (ver_cocina)
        capa_cocina();

    if (ver_despacho)
        color([0.73,0.60,0.42]) capa_despacho();

    if (ver_silueta)
        capa_silueta();

    if (ver_etiquetas_pilares)
        capa_etiquetas_pilares();

    if (ver_etiquetas_paredes)
        capa_etiquetas_paredes();

    if (ver_cotas)
        capa_cotas();
}
