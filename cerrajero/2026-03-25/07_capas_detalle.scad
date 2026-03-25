// Capas de detalle

module capa_cartelas() {

    // Plataforma grande: esquinas delanteras y trasera derecha
    color([0.18,0.18,0.20]) {
        // Esquina (0,0)
        cartelaYZ(x1_min - pilar_ext/2 + cartela_retr, y1_min + pilar_ext/2, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sy=1, sz=-1);
        cartelaXZ(x1_min + pilar_ext/2, y1_min - pilar_ext/2 + cartela_retr, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sx=1, sz=-1);

        // Esquina (3600,0)
        cartelaYZ(x1_max + pilar_ext/2 - cartela_retr, y1_min + pilar_ext/2, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sy=1, sz=-1);
        cartelaXZ(x1_max - pilar_ext/2, y1_min - pilar_ext/2 + cartela_retr, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sx=-1, sz=-1);

        // Esquina (3600,2600)
        cartelaYZ(x1_max + pilar_ext/2 - cartela_retr, y1_max - pilar_ext/2, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sy=-1, sz=-1);
        cartelaXZ(x1_max - pilar_ext/2, y1_max + pilar_ext/2 - cartela_retr, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sx=-1, sz=-1);

        // Cama/plataforma superior: dos esquinas de pared
        cartelaYZ(p8_x - pilar_ext/2 + cartela_retr, p8_y - pilar_ext/2, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sy=-1, sz=-1);
        cartelaXZ(p8_x + pilar_ext/2, p8_y + pilar_ext/2 - cartela_retr, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sx=1, sz=-1);

        cartelaYZ(p5_x + pilar_ext/2 - cartela_retr, p5_y - pilar_ext/2, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sy=-1, sz=-1);
        cartelaXZ(p5_x - pilar_ext/2, p5_y + pilar_ext/2 - cartela_retr, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sx=-1, sz=-1);
    }
}

module pasamanos_segmento(p0, p1, z_inf) {
    largo = segmento_largo(p0, p1);
    ang = segmento_angulo(p0, p1);

    if (largo > 0)
        translate([p0[0], p0[1], z_inf])
            rotate([0, 0, ang])
                translate([0, -bar_pasamanos_b/2, 0])
                    tubo(largo, bar_pasamanos_b, bar_pasamanos_h, bar_pasamanos_esp);
}

module rodapie_segmento(p0, p1, z_inf) {
    largo = segmento_largo(p0, p1);
    ang = segmento_angulo(p0, p1);

    if (largo > 0)
        translate([p0[0], p0[1], z_inf])
            rotate([0, 0, ang])
                translate([0, -rodapie_esp/2, 0])
                    cube([largo, rodapie_esp, rodapie_h]);
}

module barrotes_segmento(p0, p1, z_base, h) {
    largo = segmento_largo(p0, p1);

    if (largo > barrote_sep_max) {
        n = floor(largo / barrote_sep_max);
        paso = largo / (n + 1);

        for (i = [1:n]) {
            p = punto_en_segmento(p0, p1, i * paso);
            barroteV(p[0], p[1], z_base, h);
        }
    }
}

module tramo_barandilla_segmento(p0, p1, z_base, h) {
    poste_barandilla(p0[0], p0[1], z_base, h);
    poste_barandilla(p1[0], p1[1], z_base, h);

    pasamanos_segmento(p0, p1, z_base + h - bar_pasamanos_h);
    pasamanos_segmento(p0, p1, z_base + rodapie_h + h_barrotes/2);
    rodapie_segmento(p0, p1, z_base);
    barrotes_segmento(p0, p1, z_base + rodapie_h, h_barrotes);
}

module tramo_barandilla_segmento_bajo_tablero(p0, p1, z_base, z_tablero) {
    h_bar_local = z_tablero - z_base - 40;
    h_barrotes_local = h_bar_local - rodapie_h - bar_pasamanos_h;

    poste_barandilla(p0[0], p0[1], z_base, h_bar_local);
    poste_barandilla(p1[0], p1[1], z_base, h_bar_local);

    pasamanos_segmento(p0, p1, z_base + h_bar_local - bar_pasamanos_h);
    pasamanos_segmento(p0, p1, z_base + rodapie_h + h_barrotes_local/2);
    rodapie_segmento(p0, p1, z_base);
    barrotes_segmento(p0, p1, z_base + rodapie_h, h_barrotes_local);
}

module capa_barandillas() {
    desk_bar_p0 = punto_en_segmento(desk_p0, desk_p0_in, 500);
    desk_bar_p1 = punto_en_segmento(desk_p1, desk_p1_in, 500);

    // Cama: borde libre hacia la cocina, siguiendo la viga sur.
    tramo_barandilla_segmento(cama_sw, cama_se, z_bar_pequena, bar_h);

    // Despacho: barandilla baja bajo el tablero para retener en la viga sur.
    tramo_barandilla_segmento_bajo_tablero(
        desk_bar_p0,
        desk_bar_p1,
        z_viga_grande + viga_h,
        z_suelo_grande + despacho_alto_tablero
    );
}

module capa_hueco() {
    color([1,0,0,0.18])
    translate([hueco_esc_x_min, hueco_esc_y_min, 0])
        cube([
            hueco_esc_x_max - hueco_esc_x_min,
            hueco_esc_y_max - hueco_esc_y_min,
            altura_pequena + 1200
        ]);
}

module capa_habitacion() {
    puerta_principal_x_centro = L_hab - puerta_ancho/2;
    puerta_bano_x_centro = L_hab - puerta_ancho - puerta_bano_sep - puerta_bano_ancho/2;
    puerta_bano_x_der = L_hab - puerta_ancho - puerta_bano_sep;
    bano_x_max = puerta_bano_x_der;
    bano_x_min = 0;
    huecos_oeste = [
        [puerta_principal_x_centro - puerta_ancho/2, puerta_ancho, puerta_alto],
        [puerta_bano_x_centro - puerta_bano_ancho/2, puerta_bano_ancho, puerta_bano_alto]
    ];

    color([1,1,1]) {
        losa_poligonal(hab_contorno, 8);
        muro_segmento(hab_pared_sur_a, hab_pared_sur_b, H_hab, hab_muro_esp);
        muro_segmento_con_huecos(hab_pared_oeste_a, hab_pared_oeste_b, H_hab, hab_muro_esp, huecos_oeste);
        muro_segmento(hab_pared_norte_a, hab_pared_norte_b, H_hab, hab_muro_esp);
        muro_segmento(hab_pared_este_a, hab_pared_este_b, H_hab, hab_muro_esp);
    }

    caja_anexo_exterior(
        bano_x_min, bano_x_max,
        W_hab, bano_fondo, H_hab, hab_muro_esp
    );

    color([1,1,1])
        tabique_x(puerta_bano_x_der, W_hab, W_hab + bano_fondo, H_hab, hab_muro_esp);
}

module capa_techo() {
    puerta_bano_x_der = L_hab - puerta_ancho - puerta_bano_sep;

    color([1,1,1])
        losa_poligonal(hab_contorno, hab_muro_esp, H_hab);
    techo_rect(0, puerta_bano_x_der, W_hab, W_hab + bano_fondo, H_hab, hab_muro_esp);
}

module capa_silueta() {
    silueta_persona(
        hueco_esc_x_max + 350,
        hueco_esc_y_min + 450,
        z_suelo_grande,
        silueta_h
    );

    silueta_persona(
        x1_min + cocina_fondo + 320,
        W_hab - cocina_fondo - 320,
        0,
        silueta_h
    );
}

module capa_escalera(){
    escalera_recta_x(
        x_llegada=esc_recta_x_llegada,
        y_ini=esc_recta_y_ini,
        z_llegada=z_sup_grande,
        ancho=ancho_escalera,
        huella=esc_recta_huella,
        num_peldanos=esc_recta_num_peldanos,
        esp_peldano=esc_recta_esp_peldano,
        zanca_b=esc_recta_zanca_b,
        zanca_h=esc_recta_zanca_h,
        poste_d=esc_recta_poste_d,
        pasamanos_d=esc_recta_pasamanos_d
    );
}

module cota_x(xa, xb, y, z, txt) {
    color(cota_color) {
        translate([xa, y, z]) cube([xb - xa, 2, 2]);
        translate([xa, y - cota_marca/2, z]) cube([2, cota_marca, 2]);
        translate([xb, y - cota_marca/2, z]) cube([2, cota_marca, 2]);
        translate([(xa + xb)/2, y + 20, z])
            linear_extrude(height=cota_esp)
                text(txt, size=cota_tam_texto, halign="center", valign="center");
    }
}

module cota_y(x, ya, yb, z, txt) {
    color(cota_color) {
        translate([x, ya, z]) cube([2, yb - ya, 2]);
        translate([x - cota_marca/2, ya, z]) cube([cota_marca, 2, 2]);
        translate([x - cota_marca/2, yb, z]) cube([cota_marca, 2, 2]);
        translate([x - 20, (ya + yb)/2, z])
            rotate([0,0,90])
                linear_extrude(height=cota_esp)
                    text(txt, size=cota_tam_texto, halign="center", valign="center");
    }
}

module etiqueta_pilar(txt, x, y, dx=etiqueta_pilar_dx, dy=etiqueta_pilar_dy, z=etiqueta_pilar_z) {
    color([0.85,0.10,0.10])
    translate([x + dx, y + dy, z])
        rotate([90,0,0])
            linear_extrude(height=etiqueta_pilar_esp)
                text(txt, size=etiqueta_pilar_tam, halign="center", valign="center");
}

module etiqueta_pared(txt, p0, p1, z=40) {
    centro = segmento_centro(p0, p1);
    ang = segmento_angulo(p0, p1);

    color([0.10,0.35,0.80])
        translate([centro[0], centro[1], z])
            rotate([90, 0, ang])
                linear_extrude(height=2)
                    text(txt, size=90, halign="center", valign="center");
}

module capa_etiquetas_pilares() {
    etiqueta_pilar("P1", x1_min,            y1_min,            70,  90);
    etiqueta_pilar("P2", x1_min,            esc_recta_y_llegada, 70,  90);
    etiqueta_pilar("P3", esc_recta_x_fin,   y1_min,           -70,  90);
    etiqueta_pilar("P4", hueco_esc_x_max,   hueco_esc_y_max,  -70, -90);
    etiqueta_pilar("P5", p5_x,              p5_y,             -70, -90);
    etiqueta_pilar("P6", p6_x,              p6_y,             -70, -90);
    etiqueta_pilar("P7", (x1_min+x1_max)/2, y1_min,             0,  90);

    etiqueta_pilar("P8",  p8_x, p8_y,      70, -90);
    etiqueta_pilar("P9",  p9_x, p9_y,      70, -90);
    etiqueta_pilar("P10", x2_min, y2_min,   70,  90);
    etiqueta_pilar("P11", x2_max, y2_min,  -70,  90);
}

module capa_etiquetas_paredes() {
    etiqueta_pared("SUR", hab_pared_sur_a, hab_pared_sur_b);
    etiqueta_pared("OESTE", hab_pared_oeste_a, hab_pared_oeste_b);
    etiqueta_pared("NORTE", hab_pared_norte_a, hab_pared_norte_b);
    etiqueta_pared("ESTE", hab_pared_este_a, hab_pared_este_b);
}

module capa_cotas() {
    zc = 30;

    cota_x(x1_min, x1_max, y1_min - cota_sep, zc, str(L1, " mm"));
    cota_y(x1_max + cota_sep, y1_min, y1_max, zc, str(W1, " mm"));

    cota_x(hueco_esc_x_min, hueco_esc_x_max, hueco_esc_y_min - 120, zc, str(hueco_esc_x_max - hueco_esc_x_min, " mm"));
    cota_y(hueco_esc_x_max + 120, hueco_esc_y_min, hueco_esc_y_max, zc, str(hueco_esc_y_max - hueco_esc_y_min, " mm"));

    cota_x(esc_recta_x_ini, esc_recta_x_fin, esc_recta_y_llegada - 60, zc, str(ancho_escalera, " mm"));
}
