// Modulos basicos

module tubo(dx,dy,dz,esp){
    difference(){
        cube([dx,dy,dz]);
        translate([esp,esp,esp])
            cube([dx-2*esp, dy-2*esp, dz-2*esp]);
    }
}

module placa_base_geom(){
    difference(){
        translate([-base_lado/2, -base_lado/2, 0])
            cube([base_lado, base_lado, base_esp]);

        for (sx=[-1,1], sy=[-1,1]){
            translate([
                sx*(base_lado/2 - taladro_margen),
                sy*(base_lado/2 - taladro_margen),
                -1
            ])
                cylinder(h=base_esp+2, d=taladro_d, $fn=40);
        }
    }
}

module placa_base(x,y){
    translate([x,y,0]) placa_base_geom();
}

module pilarC(x,y,h){
    if (ver_placas_base)
        placa_base(x,y);

    translate([x - pilar_ext/2, y - pilar_ext/2, base_esp])
        tubo(pilar_ext, pilar_ext, h - base_esp, pilar_esp);
}

module pilar_sin_baseC(x,y,z0,h){
    translate([x - pilar_ext/2, y - pilar_ext/2, z0])
        tubo(pilar_ext, pilar_ext, h, pilar_esp);
}

module vigaXc(x_ini, x_fin, y_centro, z_inf){
    largo = x_fin - x_ini;
    if (largo > 0)
        translate([x_ini, y_centro - viga_b/2, z_inf])
            tubo(largo, viga_b, viga_h, viga_esp);
}

module vigaYc(x_centro, y_ini, y_fin, z_inf){
    largo = y_fin - y_ini;
    if (largo > 0)
        translate([x_centro - viga_b/2, y_ini, z_inf])
            tubo(viga_b, largo, viga_h, viga_esp);
}

module secXc(x_ini, x_fin, y_centro, z_inf){
    largo = x_fin - x_ini;
    if (largo > 0)
        translate([x_ini, y_centro - sec_ext/2, z_inf])
            tubo(largo, sec_ext, sec_ext, sec_esp);
}

module secYc(x_centro, y_ini, y_fin, z_inf){
    largo = y_fin - y_ini;
    if (largo > 0)
        translate([x_centro - sec_ext/2, y_ini, z_inf])
            tubo(sec_ext, largo, sec_ext, sec_esp);
}

module tablero_rect(x_ini, x_fin, y_ini, y_fin, z_inf){
    if ((x_fin > x_ini) && (y_fin > y_ini))
        translate([x_ini, y_ini, z_inf])
            cube([x_fin - x_ini, y_fin - y_ini, tablero_esp]);
}

module laminado_rect(x_ini, x_fin, y_ini, y_fin, z_inf){
    if ((x_fin > x_ini) && (y_fin > y_ini))
        translate([x_ini, y_ini, z_inf])
            cube([x_fin - x_ini, y_fin - y_ini, laminado_esp]);
}

function segmento_dx(p0, p1) = p1[0] - p0[0];
function segmento_dy(p0, p1) = p1[1] - p0[1];
function segmento_largo(p0, p1) = sqrt(pow(segmento_dx(p0, p1), 2) + pow(segmento_dy(p0, p1), 2));
function segmento_angulo(p0, p1) = atan2(segmento_dy(p0, p1), segmento_dx(p0, p1));
function segmento_centro(p0, p1) = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
function punto_en_segmento(p0, p1, dist) =
    let(l = segmento_largo(p0, p1))
    (l > 0
        ? [p0[0] + segmento_dx(p0, p1) * (dist / l), p0[1] + segmento_dy(p0, p1) * (dist / l)]
        : p0);
function interpola_punto(p0, p1, t) = [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
function punto_en_y(p0, p1, y_obj) =
    let(dy = p1[1] - p0[1])
    (abs(dy) > 0.0001
        ? interpola_punto(p0, p1, (y_obj - p0[1]) / dy)
        : p0);

module losa_poligonal(points, esp, z0=0){
    translate([0, 0, z0])
        linear_extrude(height=esp)
            polygon(points);
}

module muro_segmento(p0, p1, z_alt, esp_muro){
    largo = segmento_largo(p0, p1);
    ang = segmento_angulo(p0, p1);

    if (largo > 0)
        translate([p0[0], p0[1], 0])
            rotate([0, 0, ang])
                translate([0, -esp_muro/2, 0])
                    cube([largo, esp_muro, z_alt]);
}

module muro_segmento_con_huecos(p0, p1, z_alt, esp_muro, huecos=[]){
    largo = segmento_largo(p0, p1);
    ang = segmento_angulo(p0, p1);

    if (largo > 0)
        translate([p0[0], p0[1], 0])
            rotate([0, 0, ang])
                difference() {
                    translate([0, -esp_muro/2, 0])
                        cube([largo, esp_muro, z_alt]);

                    for (h = huecos)
                        translate([h[0], -esp_muro/2 - 1, 0])
                            cube([h[1], esp_muro + 2, h[2]]);
                }
}

module viga_segmento(p0, p1, z_inf){
    largo = segmento_largo(p0, p1);
    ang = segmento_angulo(p0, p1);

    if (largo > 0)
        translate([p0[0], p0[1], z_inf])
            rotate([0, 0, ang])
                translate([0, -viga_b/2, 0])
                    tubo(largo, viga_b, viga_h, viga_esp);
}

module sec_segmento(p0, p1, z_inf){
    largo = segmento_largo(p0, p1);
    ang = segmento_angulo(p0, p1);

    if (largo > 0)
        translate([p0[0], p0[1], z_inf])
            rotate([0, 0, ang])
                translate([0, -sec_ext/2, 0])
                    tubo(largo, sec_ext, sec_ext, sec_esp);
}

module tablero_poligonal(points, z_inf){
    losa_poligonal(points, tablero_esp, z_inf);
}

module laminado_poligonal(points, z_inf){
    losa_poligonal(points, laminado_esp, z_inf);
}

module muro_y_con_hueco(x_ini, x_fin, y, z_alt, esp_muro, hueco_x_centro, hueco_ancho, hueco_alto){
    difference() {
        translate([x_ini, y, 0])
            cube([x_fin - x_ini, esp_muro, z_alt]);

        translate([hueco_x_centro - hueco_ancho/2, y - 1, 0])
            cube([hueco_ancho, esp_muro + 2, hueco_alto]);
    }
}

module muro_y_con_dos_huecos(x_ini, x_fin, y, z_alt, esp_muro,
                             hueco1_x_centro, hueco1_ancho, hueco1_alto,
                             hueco2_x_centro, hueco2_ancho, hueco2_alto){
    difference() {
        translate([x_ini, y, 0])
            cube([x_fin - x_ini, esp_muro, z_alt]);

        translate([hueco1_x_centro - hueco1_ancho/2, y - 1, 0])
            cube([hueco1_ancho, esp_muro + 2, hueco1_alto]);

        translate([hueco2_x_centro - hueco2_ancho/2, y - 1, 0])
            cube([hueco2_ancho, esp_muro + 2, hueco2_alto]);
    }
}

module caja_habitacion(x_ini, x_fin, y_ini, y_fin, z_alt, esp_muro,
                       puerta_x_centro, puerta_ancho, puerta_alto,
                       puerta2_x_centro, puerta2_ancho, puerta2_alto){
    color([1,1,1]) {
        translate([x_ini, y_ini, 0])
            cube([x_fin - x_ini, y_fin - y_ini, 8]);

        translate([x_ini - esp_muro, y_ini, 0])
            cube([esp_muro, y_fin - y_ini, z_alt]);

        translate([x_ini, y_ini - esp_muro, 0])
            cube([x_fin - x_ini, esp_muro, z_alt]);

        translate([x_fin, y_ini, 0])
            cube([esp_muro, y_fin - y_ini, z_alt]);

        muro_y_con_dos_huecos(
            x_ini, x_fin, y_fin, z_alt, esp_muro,
            puerta_x_centro, puerta_ancho, puerta_alto,
            puerta2_x_centro, puerta2_ancho, puerta2_alto
        );
    }
}

module caja_anexo_exterior(x_ini, x_fin, y_base, fondo, z_alt, esp_muro){
    color([1,1,1]) {
        translate([x_ini, y_base, 0])
            cube([x_fin - x_ini, fondo, 8]);

        translate([x_ini - esp_muro, y_base, 0])
            cube([esp_muro, fondo, z_alt]);

        translate([x_fin, y_base, 0])
            cube([esp_muro, fondo, z_alt]);

        translate([x_ini, y_base + fondo, 0])
            cube([x_fin - x_ini, esp_muro, z_alt]);
    }
}

module techo_rect(x_ini, x_fin, y_ini, y_fin, z_alt, esp){
    color([1,1,1])
        translate([x_ini, y_ini, z_alt])
            cube([x_fin - x_ini, y_fin - y_ini, esp]);
}

module tabique_x(x_cara_izda, y_ini, y_fin, z_alt, esp_muro){
    translate([x_cara_izda, y_ini, 0])
        cube([esp_muro, y_fin - y_ini, z_alt]);
}

module silueta_persona(x, y, z0, h_total){
    h_piernas = h_total * 0.48;
    h_tronco = h_total * 0.39;
    h_cabeza = h_total * 0.13;

    color([0.15,0.15,0.18,0.85]) {
        translate([x, y, z0])
            cylinder(h=h_piernas, d=silueta_cuerpo_d * 0.55, $fn=32);

        translate([x, y, z0 + h_piernas])
            cylinder(h=h_tronco, d=silueta_cuerpo_d, $fn=32);

        translate([x, y, z0 + h_piernas + h_tronco + h_cabeza/2])
            sphere(d=silueta_cabeza_d, $fn=32);
    }
}

module poste_barandilla(x,y,z_base,h){
    translate([x - bar_posto_ext/2, y - bar_posto_ext/2, z_base])
        tubo(bar_posto_ext, bar_posto_ext, h, bar_posto_esp);
}

module pasamanosX(x_ini, x_fin, y_centro, z_inf){
    largo = x_fin - x_ini;
    if (largo > 0)
        translate([x_ini, y_centro - bar_pasamanos_b/2, z_inf])
            tubo(largo, bar_pasamanos_b, bar_pasamanos_h, bar_pasamanos_esp);
}

module pasamanosY(x_centro, y_ini, y_fin, z_inf){
    largo = y_fin - y_ini;
    if (largo > 0)
        translate([x_centro - bar_pasamanos_b/2, y_ini, z_inf])
            tubo(bar_pasamanos_b, largo, bar_pasamanos_h, bar_pasamanos_esp);
}

module rodapieX(x_ini, x_fin, y_centro, z_inf){
    if (x_fin > x_ini)
        translate([x_ini, y_centro - rodapie_esp/2, z_inf])
            cube([x_fin - x_ini, rodapie_esp, rodapie_h]);
}

module rodapieY(x_centro, y_ini, y_fin, z_inf){
    if (y_fin > y_ini)
        translate([x_centro - rodapie_esp/2, y_ini, z_inf])
            cube([rodapie_esp, y_fin - y_ini, rodapie_h]);
}

module barroteV(x,y,z_base,h){
    translate([x - barrote_ext/2, y - barrote_ext/2, z_base])
        tubo(barrote_ext, barrote_ext, h, barrote_esp);
}

module barrotesX(x_ini, x_fin, y_centro, z_base, h){
    largo = x_fin - x_ini;
    if (largo > barrote_sep_max){
        n = floor(largo / barrote_sep_max);
        paso = largo / (n + 1);
        for(i = [1:n])
            barroteV(x_ini + i*paso, y_centro, z_base, h);
    }
}

module barrotesY(x_centro, y_ini, y_fin, z_base, h){
    largo = y_fin - y_ini;
    if (largo > barrote_sep_max){
        n = floor(largo / barrote_sep_max);
        paso = largo / (n + 1);
        for(i = [1:n])
            barroteV(x_centro, y_ini + i*paso, z_base, h);
    }
}
