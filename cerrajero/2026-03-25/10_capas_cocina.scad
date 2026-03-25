// Capas y composicion especifica de cocina

function cocina_parametros_layout() =
    let(
        puerta_bano_x_izq = x2_max - puerta_ancho - puerta_bano_sep - puerta_bano_ancho,
        frente_cocina = min(cocina_lado_largo, puerta_bano_x_izq - x1_min),
        modulo_frente = frente_cocina / cocina_modulos_frente,
        retorno_real = min(cocina_retorno, W_hab - hueco_esc_y_max),
        cocina_y_ini = W_hab - retorno_real,
        x_col_fin = x1_min + modulo_frente,
        x_mod_2_fin = x_col_fin + modulo_frente,
        x_mod_3_fin = x1_min + frente_cocina,
        y_mod_cercano_ini = max(cocina_y_ini - 520, hueco_esc_y_max + 80),
        y_mod_cercano_fin = cocina_y_ini + 80
    )
    [
        cocina_y_ini,
        x_col_fin,
        x_mod_2_fin,
        x_mod_3_fin,
        y_mod_cercano_ini,
        y_mod_cercano_fin
    ];

module cocina_frente_principal(x_col_fin, x_mod_2_fin, x_mod_3_fin) {
    // Frente principal aproximado a tres modulos: columna + dos modulos de trabajo.
    columna_cocina_rect(
        x1_min, x_col_fin,
        W_hab - cocina_fondo, W_hab,
        0, cocina_alto_columna
    );

    mueble_bajo_rect(
        x_col_fin, x_mod_2_fin,
        W_hab - cocina_fondo, W_hab,
        0, cocina_alto_cuerpo, cocina_encimera_esp
    );
    electrodomestico_frontal(
        x_col_fin, x_mod_2_fin,
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

module cocina_retorno(cocina_y_ini, y_mod_cercano_ini, y_mod_cercano_fin) {
    // Retorno en L para aproximar el fregadero y apoyo lateral.
    mueble_bajo_rect(
        x1_min, x1_min + cocina_fondo,
        cocina_y_ini, W_hab,
        0, cocina_alto_cuerpo, cocina_encimera_esp
    );
    mueble_alto_rect(
        x1_min, x1_min + cocina_fondo_altos,
        cocina_y_ini + 120, W_hab,
        cocina_z_inferior_altos, cocina_alto_altos
    );
    mueble_bajo_rect(
        x1_min, x1_min + cocina_fondo,
        y_mod_cercano_ini, y_mod_cercano_fin,
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
    y_mod_cercano_ini = layout[4];
    y_mod_cercano_fin = layout[5];

    cocina_frente_principal(x_col_fin, x_mod_2_fin, x_mod_3_fin);
    cocina_retorno(cocina_y_ini, y_mod_cercano_ini, y_mod_cercano_fin);
}
