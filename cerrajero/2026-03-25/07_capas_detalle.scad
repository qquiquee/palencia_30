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

        // Plataforma pequena: dos esquinas exteriores
        cartelaYZ(x_p8 - pilar_ext/2 + cartela_retr, y2_max - pilar_ext/2, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sy=-1, sz=-1);
        cartelaXZ(x_p8 + pilar_ext/2, y2_max + pilar_ext/2 - cartela_retr, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sx=1, sz=-1);

        cartelaYZ(x2_max + pilar_ext/2 - cartela_retr, y2_max - pilar_ext/2, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sy=-1, sz=-1);
        cartelaXZ(x2_max - pilar_ext/2, y2_max + pilar_ext/2 - cartela_retr, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sx=-1, sz=-1);
    }
}

module capa_barandillas() {
    // Proteccion del hueco de escalera en plataforma baja
    poste_barandilla(x1_min,          y1_min,          z_bar_grande, bar_h);
    poste_barandilla(x1_min,          hueco_esc_y_min, z_bar_grande, bar_h);
    poste_barandilla(x1_min,          hueco_esc_y_max, z_bar_grande, bar_h);
    poste_barandilla(hueco_esc_x_max, hueco_esc_y_min, z_bar_grande, bar_h);
    poste_barandilla(hueco_esc_x_max, hueco_esc_y_max, z_bar_grande, bar_h);
    poste_barandilla(x1_min,          y2_min,          z_bar_grande, bar_h);
    poste_barandilla(x2_min,          y2_min,          z_bar_grande, bar_h);

    // Lateral del descansillo superior: la boca de escalera queda libre en todo el ancho.
    pasamanosY(x1_min, y1_min, hueco_esc_y_min, z_bar_grande + bar_h - bar_pasamanos_h);
    pasamanosY(x1_min, y1_min, hueco_esc_y_min, z_bar_grande + rodapie_h + h_barrotes/2);
    rodapieY(x1_min, y1_min, hueco_esc_y_min, z_bar_grande);
    barrotesY(x1_min, y1_min, hueco_esc_y_min, z_bar_grande + rodapie_h, h_barrotes);

    pasamanosY(hueco_esc_x_max, hueco_esc_y_min, hueco_esc_y_max, z_bar_grande + bar_h - bar_pasamanos_h);
    pasamanosY(hueco_esc_x_max, hueco_esc_y_min, hueco_esc_y_max, z_bar_grande + rodapie_h + h_barrotes/2);
    rodapieY(hueco_esc_x_max, hueco_esc_y_min, hueco_esc_y_max, z_bar_grande);
    barrotesY(hueco_esc_x_max, hueco_esc_y_min, hueco_esc_y_max, z_bar_grande + rodapie_h, h_barrotes);

    // Cierre del hueco hacia la cocina y continuidad hasta la pared izquierda.
    pasamanosX(x1_min, hueco_esc_x_max, hueco_esc_y_max, z_bar_grande + bar_h - bar_pasamanos_h);
    pasamanosX(x1_min, hueco_esc_x_max, hueco_esc_y_max, z_bar_grande + rodapie_h + h_barrotes/2);
    rodapieX(x1_min, hueco_esc_x_max, hueco_esc_y_max, z_bar_grande);
    barrotesX(x1_min, hueco_esc_x_max, hueco_esc_y_max, z_bar_grande + rodapie_h, h_barrotes);

    // Plataforma superior - lateral exterior y cierre frontal hasta la pared izquierda
    poste_barandilla(x2_min, y2_min, z_bar_pequena, bar_h);
    poste_barandilla(x2_min, y2_max, z_bar_pequena, bar_h);

    pasamanosX(x1_min, x2_min, y2_min, z_bar_grande + bar_h - bar_pasamanos_h);
    pasamanosX(x1_min, x2_min, y2_min, z_bar_grande + rodapie_h + h_barrotes/2);
    rodapieX(x1_min, x2_min, y2_min, z_bar_grande);
    barrotesX(x1_min, x2_min, y2_min, z_bar_grande + rodapie_h, h_barrotes);

    pasamanosY(x2_min, y2_min, y2_max, z_bar_pequena + bar_h - bar_pasamanos_h);
    pasamanosY(x2_min, y2_min, y2_max, z_bar_pequena + rodapie_h + h_barrotes/2);
    rodapieY(x2_min, y2_min, y2_max, z_bar_pequena);
    barrotesY(x2_min, y2_min, y2_max, z_bar_pequena + rodapie_h, h_barrotes);
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
    puerta_principal_x_centro = x2_max - puerta_ancho/2;
    puerta_bano_x_centro = x2_max - puerta_ancho - puerta_bano_sep - puerta_bano_ancho/2;
    puerta_bano_x_der = x2_max - puerta_ancho - puerta_bano_sep;
    bano_x_max = puerta_bano_x_der;
    bano_x_min = 0;

    caja_habitacion(
        0, L_hab, 0, W_hab, H_hab, hab_muro_esp,
        puerta_principal_x_centro, puerta_ancho, puerta_alto,
        puerta_bano_x_centro, puerta_bano_ancho, puerta_bano_alto
    );

    caja_anexo_exterior(
        bano_x_min, bano_x_max,
        W_hab, bano_fondo, H_hab, hab_muro_esp
    );

    color([1,1,1])
        tabique_x(puerta_bano_x_der, W_hab, W_hab + bano_fondo, H_hab, hab_muro_esp);
}

module capa_techo() {
    puerta_bano_x_der = x2_max - puerta_ancho - puerta_bano_sep;

    techo_rect(0, L_hab, 0, W_hab, H_hab, hab_muro_esp);
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
    escalera_recta_y(
        x_ini=esc_recta_x_ini,
        y_llegada=esc_recta_y_llegada,
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

module capa_etiquetas_pilares() {
    etiqueta_pilar("P1", x1_min,            y1_min,            70,  90);
    etiqueta_pilar("P2", x1_min,            esc_recta_y_llegada, 70,  90);
    etiqueta_pilar("P3", esc_recta_x_fin,   y1_min,           -70,  90);
    etiqueta_pilar("P4", hueco_esc_x_max,   hueco_esc_y_max,  -70, -90);
    etiqueta_pilar("P5", x1_max,            y1_min,           -70,  90);
    etiqueta_pilar("P6", x1_max,            y1_max,           -70, -90);
    etiqueta_pilar("P7", (x1_min+x1_max)/2, y1_min,             0,  90);

    etiqueta_pilar("P8",  x_p8,  y2_max,   70, -90);
    etiqueta_pilar("P9",  x2_max, y2_max,  -70, -90);
    etiqueta_pilar("P10", x2_min, y2_min,   70,  90);
    etiqueta_pilar("P11", x2_max, y2_min,  -70,  90);
}

module capa_cotas() {
    zc = 30;

    cota_x(x1_min, x1_max, y1_min - cota_sep, zc, str(L1, " mm"));
    cota_y(x1_max + cota_sep, y1_min, y1_max, zc, str(W1, " mm"));

    cota_x(hueco_esc_x_min, hueco_esc_x_max, hueco_esc_y_min - 120, zc, str(hueco_esc_x_max - hueco_esc_x_min, " mm"));
    cota_y(hueco_esc_x_max + 120, hueco_esc_y_min, hueco_esc_y_max, zc, str(hueco_esc_y_max - hueco_esc_y_min, " mm"));

    cota_x(esc_recta_x_ini, esc_recta_x_fin, esc_recta_y_llegada - 60, zc, str(ancho_escalera, " mm"));
}
