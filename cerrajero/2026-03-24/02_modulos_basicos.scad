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

module caja_habitacion(x_ini, x_fin, y_ini, y_fin, z_alt, esp_muro){
    color([0.92,0.92,0.94,0.20]) {
        translate([x_ini, y_ini, 0])
            cube([x_fin - x_ini, y_fin - y_ini, 8]);

        translate([x_ini - esp_muro, y_ini, 0])
            cube([esp_muro, y_fin - y_ini, z_alt]);

        translate([x_ini, y_ini - esp_muro, 0])
            cube([x_fin - x_ini, esp_muro, z_alt]);

        translate([x_fin, y_ini, 0])
            cube([esp_muro, y_fin - y_ini, z_alt]);

        translate([x_ini, y_fin, 0])
            cube([x_fin - x_ini, esp_muro, z_alt]);
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
