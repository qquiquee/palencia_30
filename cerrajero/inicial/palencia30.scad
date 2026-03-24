// =====================================================
// PROYECTO COMPLETO - ESTRUCTURA + BARANDILLAS + ESCALERA
// OpenSCAD
// =====================================================


// =====================
// PARÁMETROS GENERALES (mm)
// =====================
altura_grande  = 1800;
altura_pequena = 2000;

L1 = 3600;
W1 = 2600;   // plataforma grande

L2 = 2000;
W2 = 1600;   // plataforma pequeña

pilar_ext = 80;
pilar_esp = 3;

viga_h   = 100;
viga_b   = 50;
viga_esp = 3;

sec_ext = 40;
sec_esp = 3;

// Cartelas
cartela_ala = 260;   // proyección en viga/pilar
cartela_esp = 8;     // espesor
cartela_retr = 6;    // pequeño retranqueo visual

base_lado = 160;
base_esp  = 10;
taladro_d = 18;
taladro_margen = 25;

// Hueco de escalera
hueco_lado = 1250;

// Secundarios
paso_sec_grande = 800;
paso_sec_pequena = 800;

// Suelo
tablero_esp = 30;
laminado_esp = 8;

// Barandillas
bar_h = 900;
bar_posto_ext = 40;
bar_posto_esp = 2;
bar_pasamanos_h = 40;
bar_pasamanos_b = 40;
bar_pasamanos_esp = 2;

// Rodapié
rodapie_h = 150;
rodapie_esp = 3;

// Barrotes
barrote_ext = 20;
barrote_esp = 2;
barrote_sep_max = 120;

// Apertura libre de salida de escalera
salida_escalera = 700;


// =====================
// VISIBILIDAD DE CAPAS
// =====================
ver_pilares      = true;
ver_vigas        = true;
ver_secundarios  = true;
ver_suelo        = false;
ver_barandilla   = true;
ver_cartelas     = true;
ver_hueco        = false;
ver_placas_base  = true;
ver_escalera     = true;
ver_vol_esc      = false;


// =====================
// PARÁMETROS ESCALERA DE CARACOL
// =====================
esc_d_ext = 1100;
esc_radio_ext = esc_d_ext / 2;
esc_mastil_d = 140;
esc_h = altura_pequena + tablero_esp + laminado_esp;

// Escalera pensada DESDE ARRIBA HACIA ABAJO
esc_num_peldanos = 11;
esc_esp_peldano = 8;
esc_giro_total = 360;
esc_ancho_angular_peldano = 28;

// CAMBIADO: ahora gira en el otro sentido
//  1  = antihorario al bajar
// -1  = horario al bajar
esc_sentido = 1;

// El peldaño superior (salida/desembarco) apunta hacia la apertura libre
esc_ang_salida = 180;
esc_ang_inicio = esc_ang_salida;

esc_poste_ext_d = 16;
esc_pasamanos_d = 35;


// =====================
// MÓDULOS BÁSICOS
// =====================
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


// =====================
// MÓDULOS CARTELAS
// =====================
module cartelaXY(x,y,z,ala=260,esp=8,sx=1,sy=1){
    translate([x, y, z])
        linear_extrude(height=esp)
            polygon(points=[
                [0,0],
                [sx*ala,0],
                [0,sy*ala]
            ]);
}

module cartelaXZ(x,y,z,ala=260,esp=8,sx=1,sz=1){
    rotate([90,0,0])
        translate([x, z, -y])
            linear_extrude(height=esp)
                polygon(points=[
                    [0,0],
                    [sx*ala,0],
                    [0,sz*ala]
                ]);
}

module cartelaYZ(x,y,z,ala=260,esp=8,sy=1,sz=1){
    rotate([90,0,90])
        translate([y, z, x])
            linear_extrude(height=esp)
                polygon(points=[
                    [0,0],
                    [sy*ala,0],
                    [0,sz*ala]
                ]);
}


// =====================
// GEOMETRÍA ESCALERA
// =====================
function polarx(r,a) = r*cos(a);
function polary(r,a) = r*sin(a);

module barra_segmento(p1, p2, d=20){
    hull(){
        translate(p1) sphere(d=d, $fn=20);
        translate(p2) sphere(d=d, $fn=20);
    }
}

module peldano_caracol_2d(r_int, r_ext, ang_grados, estrechamiento=0.58){
    a = ang_grados/2;
    r_mid = (r_int + r_ext)/2;
    r_in_aj = r_int + (r_mid - r_int) * estrechamiento;

    polygon(points=[
        [polarx(r_in_aj,-a), polary(r_in_aj,-a)],
        [polarx(r_ext,-a),   polary(r_ext,-a)],
        [polarx(r_ext, a),   polary(r_ext, a)],
        [polarx(r_in_aj, a), polary(r_in_aj, a)]
    ]);
}

module peldano_caracol(r_int, r_ext, ang, esp){
    linear_extrude(height=esp)
        peldano_caracol_2d(r_int, r_ext, ang);
}

module escalera_caracol_realista(
    x=0, y=0, z=0,
    altura=2000,
    radio_ext=550,
    mastil_d=140,
    num_peldanos=11,
    giro_total=360,
    ang_inicio=180,
    sentido=1,
    esp_peldano=8,
    ancho_angular_peldano=28,
    poste_ext_d=16,
    pasamanos_d=35,
    mostrar_volumen=false
){
    alzada = altura / num_peldanos;
    paso_angular = giro_total / num_peldanos;
    r_int = mastil_d/2 + 20;
    r_bar = radio_ext - 35;
    h_bar_esc = 900;

    // IMPORTANTE:
    // ang_inicio = ángulo del peldaño superior (salida)
    // La escalera se genera DESDE ARRIBA HACIA ABAJO

    translate([x,y,z]){

        if (mostrar_volumen)
            color([0,0,1,0.08])
                cylinder(h=altura + 200, r=radio_ext, $fn=100);

        color([0.35,0.35,0.38])
            cylinder(h=altura + 80, d=mastil_d, $fn=60);

        color([0.28,0.28,0.30])
            cylinder(h=12, d=mastil_d + 120, $fn=60);

        for(i=[0:num_peldanos-1]){
            z_i = altura - (i+1) * alzada;
            ang_i = ang_inicio - sentido * i * paso_angular;

            color([0.58,0.58,0.60])
                translate([0,0,z_i])
                    rotate([0,0,ang_i])
                        peldano_caracol(
                            r_int=r_int,
                            r_ext=radio_ext,
                            ang=ancho_angular_peldano,
                            esp=esp_peldano
                        );

            px = polarx(r_bar, ang_i);
            py = polary(r_bar, ang_i);

            color([0.45,0.45,0.48])
                translate([px, py, z_i + esp_peldano])
                    cylinder(h=h_bar_esc, d=poste_ext_d, $fn=20);
        }

        color([0.72,0.72,0.74])
        for(i=[0:num_peldanos-2]){
            z1 = altura - (i+1) * alzada + esp_peldano + h_bar_esc;
            z2 = altura - (i+2) * alzada + esp_peldano + h_bar_esc;

            a1 = ang_inicio - sentido * i * paso_angular;
            a2 = ang_inicio - sentido * (i+1) * paso_angular;

            p1 = [polarx(r_bar, a1), polary(r_bar, a1), z1];
            p2 = [polarx(r_bar, a2), polary(r_bar, a2), z2];

            barra_segmento(p1, p2, d=pasamanos_d);
        }

        // Remate superior desde el punto de salida
        color([0.72,0.72,0.74])
        for(k=[0:8]){
            aa1 = ang_inicio + sentido*(k*5);
            aa2 = ang_inicio + sentido*((k+1)*5);

            p1 = [polarx(r_bar, aa1), polary(r_bar, aa1), altura + esp_peldano + h_bar_esc];
            p2 = [polarx(r_bar, aa2), polary(r_bar, aa2), altura + esp_peldano + h_bar_esc];

            barra_segmento(p1, p2, d=pasamanos_d);
        }
    }
}


// =====================
// COTAS ÚTILES
// =====================
x1_min = 0;
x1_max = L1;
y1_min = 0;
y1_max = W1;

x2_min = L1 - L2;
x2_max = L1;
y2_min = W1;
y2_max = W1 + W2;

// Hueco de escalera en plataforma grande
hueco_x_min = 0;
hueco_x_max = hueco_lado;
hueco_y_max = W1;
hueco_y_min = W1 - hueco_lado;

z_sup_grande  = altura_grande;
z_sup_pequena = altura_pequena;

z_viga_grande  = z_sup_grande  - viga_h;
z_viga_pequena = z_sup_pequena - viga_h;

z_sec_grande  = z_sup_grande  - sec_ext;
z_sec_pequena = z_sup_pequena - sec_ext;

z_suelo_grande  = z_sup_grande  + tablero_esp + laminado_esp;
z_suelo_pequena = z_sup_pequena + tablero_esp + laminado_esp;

z_apoyo_sup = altura_grande;
h_apoyo_sup = altura_pequena - altura_grande;

// Pilar interior hacia el lado del hueco
pilar_hueco_x = 1350;
pilar_hueco_y = hueco_y_min;

z_bar_grande = z_suelo_grande;
z_bar_pequena = z_suelo_pequena;
h_barrotes = bar_h - rodapie_h - bar_pasamanos_h;

// Escalera
esc_x = hueco_x_min + hueco_lado/2;
esc_y = hueco_y_min + hueco_lado/2;


// =====================
// CAPAS ESTRUCTURA
// =====================
module capa_pilares() {
    pilarC(x1_min,            y1_min, altura_grande);
    pilarC(x1_max,            y1_min, altura_grande);
    pilarC(x1_max,            y1_max, altura_grande);
    pilarC((x1_min+x1_max)/2, y1_min, altura_grande);
    pilarC(pilar_hueco_x,     pilar_hueco_y, altura_grande);

    pilarC(x2_min, y2_max, altura_pequena);
    pilarC(x2_max, y2_max, altura_pequena);

    pilar_sin_baseC(x2_min, y2_min, z_apoyo_sup, h_apoyo_sup);
    pilar_sin_baseC(x2_max, y2_min, z_apoyo_sup, h_apoyo_sup);
}

module capa_vigas() {
    // Plataforma grande
    vigaXc(x1_min, x1_max, y1_min, z_viga_grande);
    vigaXc(hueco_x_max, x1_max, y1_max, z_viga_grande);

    vigaYc(x1_min, y1_min, hueco_y_min, z_viga_grande);
    vigaYc(x1_max, y1_min, y1_max, z_viga_grande);

    vigaYc((x1_min+x1_max)/2, y1_min, y1_max, z_viga_grande);

    vigaYc(hueco_x_max, hueco_y_min, hueco_y_max, z_viga_grande);
    vigaXc(hueco_x_min, hueco_x_max, hueco_y_min, z_viga_grande);

    // unión al pilar retranqueado
    vigaXc(hueco_x_max, pilar_hueco_x, hueco_y_min, z_viga_grande);
    vigaYc(pilar_hueco_x, hueco_y_min, y1_max, z_viga_grande);

    // Plataforma pequeña
    vigaXc(x2_min, x2_max, y2_min, z_viga_pequena);
    vigaXc(x2_min, x2_max, y2_max, z_viga_pequena);

    vigaYc(x2_min, y2_min, y2_max, z_viga_pequena);
    vigaYc(x2_max, y2_min, y2_max, z_viga_pequena);
}

module capa_secundarios() {
    // Plataforma grande
    for (ysec = [paso_sec_grande : paso_sec_grande : hueco_y_min - paso_sec_grande/2])
        secXc(x1_min, x1_max, ysec, z_sec_grande);

    for (ysec = [hueco_y_min + paso_sec_grande : paso_sec_grande : y1_max - paso_sec_grande/2])
        secXc(hueco_x_max, x1_max, ysec, z_sec_grande);

    // Plataforma pequeña
    for (ysec = [y2_min + paso_sec_pequena : paso_sec_pequena : y2_max - paso_sec_pequena/2])
        secXc(x2_min, x2_max, ysec, z_sec_pequena);
}

module capa_suelo() {
    tablero_rect(x1_min,      x1_max, y1_min,      hueco_y_min, z_sup_grande);
    laminado_rect(x1_min,     x1_max, y1_min,      hueco_y_min, z_sup_grande + tablero_esp);

    tablero_rect(hueco_x_max, x1_max, hueco_y_min, y1_max,      z_sup_grande);
    laminado_rect(hueco_x_max,x1_max, hueco_y_min, y1_max,      z_sup_grande + tablero_esp);

    tablero_rect(x2_min, x2_max, y2_min, y2_max, z_sup_pequena);
    laminado_rect(x2_min, x2_max, y2_min, y2_max, z_sup_pequena + tablero_esp);
}


// =====================
// CAPA CARTELAS
// =====================
module capa_cartelas() {

    // Plataforma grande - esquinas delanteras y trasera derecha
    color([0.18,0.18,0.20]) {
        // esquina (0,0)
        cartelaYZ(x1_min - pilar_ext/2 + cartela_retr, y1_min + pilar_ext/2, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sy=1, sz=-1);
        cartelaXZ(x1_min + pilar_ext/2, y1_min - pilar_ext/2 + cartela_retr, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sx=1, sz=-1);

        // esquina (3600,0)
        cartelaYZ(x1_max + pilar_ext/2 - cartela_retr, y1_min + pilar_ext/2, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sy=1, sz=-1);
        cartelaXZ(x1_max - pilar_ext/2, y1_min - pilar_ext/2 + cartela_retr, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sx=-1, sz=-1);

        // esquina (3600,2600)
        cartelaYZ(x1_max + pilar_ext/2 - cartela_retr, y1_max - pilar_ext/2, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sy=-1, sz=-1);
        cartelaXZ(x1_max - pilar_ext/2, y1_max + pilar_ext/2 - cartela_retr, z_viga_grande + viga_h - cartela_retr,
                  ala=cartela_ala, esp=cartela_esp, sx=-1, sz=-1);

        // pilar interior junto al hueco
        cartelaYZ(pilar_hueco_x + pilar_ext/2 - cartela_retr, pilar_hueco_y + pilar_ext/2, z_viga_grande + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sy=1, sz=-1);
        cartelaXZ(pilar_hueco_x - pilar_ext/2, pilar_hueco_y - pilar_ext/2 + cartela_retr, z_viga_grande + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sx=-1, sz=-1);

        // Plataforma pequeña - dos esquinas exteriores
        cartelaYZ(x2_min - pilar_ext/2 + cartela_retr, y2_max - pilar_ext/2, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sy=-1, sz=-1);
        cartelaXZ(x2_min + pilar_ext/2, y2_max + pilar_ext/2 - cartela_retr, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sx=1, sz=-1);

        cartelaYZ(x2_max + pilar_ext/2 - cartela_retr, y2_max - pilar_ext/2, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sy=-1, sz=-1);
        cartelaXZ(x2_max - pilar_ext/2, y2_max + pilar_ext/2 - cartela_retr, z_viga_pequena + viga_h - cartela_retr,
                  ala=220, esp=cartela_esp, sx=-1, sz=-1);
    }
}


// =====================
// CAPA BARANDILLAS
// =====================
module capa_barandillas() {

    // Plataforma inferior - hueco escalera
    // La salida libre queda en el tramo izquierdo del lado horizontal.
    // Se añade el trocito superior para enlazar con la barandilla alta.

    poste_barandilla(hueco_x_min, hueco_y_min, z_bar_grande, bar_h);
    poste_barandilla(hueco_x_max, hueco_y_min, z_bar_grande, bar_h);
    poste_barandilla(hueco_x_max, y1_max,      z_bar_grande, bar_h);
    poste_barandilla(x2_min,     y1_max,       z_bar_grande, bar_h);

    // Tramo horizontal del hueco: se deja libre la parte izquierda
    pasamanosX(hueco_x_min + salida_escalera, hueco_x_max, hueco_y_min, z_bar_grande + bar_h - bar_pasamanos_h);
    pasamanosX(hueco_x_min + salida_escalera, hueco_x_max, hueco_y_min, z_bar_grande + rodapie_h + h_barrotes/2);
    rodapieX(hueco_x_min + salida_escalera, hueco_x_max, hueco_y_min, z_bar_grande);
    barrotesX(hueco_x_min + salida_escalera, hueco_x_max, hueco_y_min, z_bar_grande + rodapie_h, h_barrotes);

    // Lado vertical derecho del hueco
    pasamanosY(hueco_x_max, hueco_y_min, y1_max, z_bar_grande + bar_h - bar_pasamanos_h);
    pasamanosY(hueco_x_max, hueco_y_min, y1_max, z_bar_grande + rodapie_h + h_barrotes/2);
    rodapieY(hueco_x_max, hueco_y_min, y1_max, z_bar_grande);
    barrotesY(hueco_x_max, hueco_y_min, y1_max, z_bar_grande + rodapie_h, h_barrotes);

    // Trocito que une con la barandilla superior
    pasamanosX(hueco_x_max, x2_min, y1_max, z_bar_grande + bar_h - bar_pasamanos_h);
    pasamanosX(hueco_x_max, x2_min, y1_max, z_bar_grande + rodapie_h + h_barrotes/2);
    rodapieX(hueco_x_max, x2_min, y1_max, z_bar_grande);
    barrotesX(hueco_x_max, x2_min, y1_max, z_bar_grande + rodapie_h, h_barrotes);

    // Plataforma superior - solo lateral exterior vertical
    poste_barandilla(x2_min, y2_min, z_bar_pequena, bar_h);
    poste_barandilla(x2_min, y2_max, z_bar_pequena, bar_h);

    pasamanosY(x2_min, y2_min, y2_max, z_bar_pequena + bar_h - bar_pasamanos_h);
    pasamanosY(x2_min, y2_min, y2_max, z_bar_pequena + rodapie_h + h_barrotes/2);
    rodapieY(x2_min, y2_min, y2_max, z_bar_pequena);
    barrotesY(x2_min, y2_min, y2_max, z_bar_pequena + rodapie_h, h_barrotes);
}


// =====================
// CAPA HUECO AUXILIAR
// =====================
module capa_hueco() {
    color([1,0,0,0.18])
    translate([hueco_x_min, hueco_y_min, 0])
        cube([
            hueco_x_max - hueco_x_min,
            hueco_y_max - hueco_y_min,
            altura_pequena + 1200
        ]);
}


// =====================
// CAPA ESCALERA
// =====================
module capa_escalera(){
    escalera_caracol_realista(
        x=esc_x,
        y=esc_y,
        z=0,
        altura=esc_h,
        radio_ext=esc_radio_ext,
        mastil_d=esc_mastil_d,
        num_peldanos=esc_num_peldanos,
        giro_total=esc_giro_total,
        ang_inicio=esc_ang_inicio,
        sentido=esc_sentido,
        esp_peldano=esc_esp_peldano,
        ancho_angular_peldano=esc_ancho_angular_peldano,
        poste_ext_d=esc_poste_ext_d,
        pasamanos_d=esc_pasamanos_d,
        mostrar_volumen=ver_vol_esc
    );
}


// =====================
// ENSAMBLAJE
// =====================
module ensamblaje() {
    if (ver_pilares)
        color([0.72,0.72,0.76]) capa_pilares();

    if (ver_vigas)
        color([0.45,0.45,0.48]) capa_vigas();

    if (ver_secundarios)
        color([0.30,0.30,0.33]) capa_secundarios();

    if (ver_suelo) {
        color([0.68,0.50,0.32]) {
            tablero_rect(x1_min,      x1_max, y1_min,      hueco_y_min, z_sup_grande);
            tablero_rect(hueco_x_max, x1_max, hueco_y_min, y1_max,      z_sup_grande);
            tablero_rect(x2_min,      x2_max, y2_min,      y2_max,      z_sup_pequena);
        }

        color([0.82,0.70,0.50]) {
            laminado_rect(x1_min,      x1_max, y1_min,      hueco_y_min, z_sup_grande + tablero_esp);
            laminado_rect(hueco_x_max, x1_max, hueco_y_min, y1_max,      z_sup_grande + tablero_esp);
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
}

ensamblaje();