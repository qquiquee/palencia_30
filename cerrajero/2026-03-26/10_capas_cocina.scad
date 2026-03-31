// Capas y composicion especifica de cocina

function cocina_parametros_layout() =
    let(
        puerta_bano_x_izq = x2_max - puerta_ancho - puerta_bano_sep - puerta_bano_ancho,
        frente_cocina = min(cocina_lado_largo, puerta_bano_x_izq - x1_min),
        modulo_frente = frente_cocina / cocina_modulos_frente,
        retorno_real = cocina_retorno,
        cocina_y_ini = W_hab - retorno_real,
        x_col_fin = x1_min + modulo_frente,
        x_mod_2_fin = x_col_fin + modulo_frente,
        x_mod_3_fin = x1_min + frente_cocina
    )
    [
        cocina_y_ini,
        x_col_fin,
        x_mod_2_fin,
        x_mod_3_fin
    ];

module cocina_frente_principal(x_col_fin, x_mod_2_fin, x_mod_3_fin) {
    // Frente principal en dos modulos bajos, sin columna.
    mueble_bajo_rect(
        x1_min, x_mod_2_fin,
        W_hab - cocina_fondo, W_hab,
        0, cocina_alto_cuerpo, cocina_encimera_esp
    );
    electrodomestico_frontal(
        x1_min, x_mod_2_fin,
        W_hab - cocina_fondo, W_hab,
        0, cocina_alto_cuerpo - 30
    );

    mueble_bajo_rect(
        x_mod_2_fin, x_mod_3_fin,
        W_hab - cocina_fondo, W_hab,
        0, cocina_alto_cuerpo, cocina_encimera_esp
    );
    placa_encimera(
        x_mod_2_fin + 90, x_mod_3_fin - 90,
        W_hab - cocina_fondo + 150, W_hab - 150,
        cocina_alto_cuerpo + cocina_encimera_esp
    );
}

module cocina_retorno(cocina_y_ini) {
    // Retorno en L para aproximar el fregadero y apoyo lateral, sin modulos sueltos ni muebles altos.
    mueble_bajo_rect(
        x1_min, x1_min + cocina_fondo,
        cocina_y_ini, W_hab,
        0, cocina_alto_cuerpo, cocina_encimera_esp
    );
    fregadero_encimera(
        x1_min + 120, x1_min + cocina_fondo - 120,
        W_hab - 520, W_hab - 170,
        cocina_alto_cuerpo + cocina_encimera_esp
    );
}

module capa_cocina() {
    layout = cocina_parametros_layout();

    cocina_y_ini = layout[0];
    x_col_fin = layout[1];
    x_mod_2_fin = layout[2];
    x_mod_3_fin = layout[3];

    cocina_frente_principal(x_col_fin, x_mod_2_fin, x_mod_3_fin);
    cocina_retorno(cocina_y_ini);
}
