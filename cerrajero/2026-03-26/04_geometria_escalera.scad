// Geometria de escalera

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

    // ang_inicio = angulo del peldano superior (salida)
    // La escalera se genera desde arriba hacia abajo

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

module zanca_recta_desde_base(x, y_ini, y_fin, z_fin, ancho=80, canto=200){
    hull(){
        translate([x, y_ini, 0])
            cube([ancho, ancho, canto]);

        translate([x, y_fin - ancho, z_fin - canto])
            cube([ancho, ancho, canto]);
    }
}

module zanca_recta_desde_cabeza(x, y_ini, y_fin, z_ini, ancho=80, canto=200){
    hull(){
        translate([x, y_ini, z_ini - canto])
            cube([ancho, ancho, canto]);

        translate([x, y_fin - ancho, 0])
            cube([ancho, ancho, canto]);
    }
}

module pasamanos_tramo(p1, p2, d=35){
    barra_segmento(p1, p2, d=d);
}

module escalera_recta_y(
    x_ini=0,
    y_llegada=0,
    z_llegada=1600,
    ancho=900,
    huella=280,
    num_peldanos=9,
    esp_peldano=8,
    zanca_b=80,
    zanca_h=200,
    poste_d=16,
    pasamanos_d=35
){
    alzada = z_llegada / num_peldanos;
    y_ini = y_llegada;
    y_fin = y_llegada + num_peldanos * huella;
    h_bar = 900;
    x_bar_izq = x_ini + 45;
    x_bar_der = x_ini + ancho - 45;

    color([0.35,0.35,0.38]) {
        zanca_recta_desde_cabeza(x_ini + 35, y_ini, y_fin, z_llegada, ancho=zanca_b, canto=zanca_h);
        zanca_recta_desde_cabeza(x_ini + ancho - 35 - zanca_b, y_ini, y_fin, z_llegada, ancho=zanca_b, canto=zanca_h);
    }

    color([0.58,0.58,0.60])
    for(i = [0:num_peldanos-1]){
        y0 = y_ini + i * huella;
        z0 = z_llegada - i * alzada - esp_peldano;

        translate([x_ini, y0, z0])
            cube([ancho, huella, esp_peldano]);
    }

    color([0.45,0.45,0.48]) {
        for(i = [0:num_peldanos-1]){
            yp = y_ini + i * huella + huella/2;
            zp = z_llegada - i * alzada;

            translate([x_bar_izq, yp, zp])
                cylinder(h=h_bar, d=poste_d, $fn=20);
            translate([x_bar_der, yp, zp])
                cylinder(h=h_bar, d=poste_d, $fn=20);
        }

        translate([x_bar_izq, y_llegada, z_llegada + esp_peldano])
            cylinder(h=h_bar, d=poste_d, $fn=20);
        translate([x_bar_der, y_llegada, z_llegada + esp_peldano])
            cylinder(h=h_bar, d=poste_d, $fn=20);

        translate([x_bar_izq, y_fin, esp_peldano])
            cylinder(h=h_bar, d=poste_d, $fn=20);
        translate([x_bar_der, y_fin, esp_peldano])
            cylinder(h=h_bar, d=poste_d, $fn=20);
    }

    color([0.72,0.72,0.74]) {
        for(i = [0:num_peldanos-2]){
            p1_izq = [x_bar_izq, y_ini + i * huella + huella/2, z_llegada - i * alzada + h_bar];
            p2_izq = [x_bar_izq, y_ini + (i + 1) * huella + huella/2, z_llegada - (i + 1) * alzada + h_bar];
            pasamanos_tramo(p1_izq, p2_izq, d=pasamanos_d);

            p1_der = [x_bar_der, y_ini + i * huella + huella/2, z_llegada - i * alzada + h_bar];
            p2_der = [x_bar_der, y_ini + (i + 1) * huella + huella/2, z_llegada - (i + 1) * alzada + h_bar];
            pasamanos_tramo(p1_der, p2_der, d=pasamanos_d);
        }

        pasamanos_tramo(
            [x_bar_izq, y_llegada, z_llegada + esp_peldano + h_bar],
            [x_bar_izq, y_ini + huella/2, z_llegada + h_bar],
            d=pasamanos_d
        );

        pasamanos_tramo(
            [x_bar_der, y_llegada, z_llegada + esp_peldano + h_bar],
            [x_bar_der, y_ini + huella/2, z_llegada + h_bar],
            d=pasamanos_d
        );

        pasamanos_tramo(
            [x_bar_izq, y_ini + (num_peldanos - 1) * huella + huella/2, z_llegada - (num_peldanos - 1) * alzada + h_bar],
            [x_bar_izq, y_fin, esp_peldano + h_bar],
            d=pasamanos_d
        );

        pasamanos_tramo(
            [x_bar_der, y_ini + (num_peldanos - 1) * huella + huella/2, z_llegada - (num_peldanos - 1) * alzada + h_bar],
            [x_bar_der, y_fin, esp_peldano + h_bar],
            d=pasamanos_d
        );
    }
}

module escalera_recta_x(
    x_llegada=0,
    y_ini=0,
    z_llegada=1600,
    ancho=900,
    huella=280,
    num_peldanos=9,
    esp_peldano=8,
    zanca_b=80,
    zanca_h=200,
    poste_d=16,
    pasamanos_d=35
){
    alzada = z_llegada / num_peldanos;
    x_ini = x_llegada - num_peldanos * huella;
    x_fin = x_llegada;
    h_bar = 900;
    y_bar_izq = y_ini + 45;
    y_bar_der = y_ini + ancho - 45;

    color([0.35,0.35,0.38]) {
        hull() {
            translate([x_ini, y_ini + 35, 0])
                cube([zanca_h, zanca_b, zanca_b]);
            translate([x_fin - zanca_h, y_ini + 35, z_llegada - zanca_b])
                cube([zanca_h, zanca_b, zanca_b]);
        }

        hull() {
            translate([x_ini, y_ini + ancho - 35 - zanca_b, 0])
                cube([zanca_h, zanca_b, zanca_b]);
            translate([x_fin - zanca_h, y_ini + ancho - 35 - zanca_b, z_llegada - zanca_b])
                cube([zanca_h, zanca_b, zanca_b]);
        }
    }

    color([0.58,0.58,0.60])
    for(i = [0:num_peldanos-1]){
        x0 = x_fin - (i + 1) * huella;
        z0 = z_llegada - i * alzada - esp_peldano;

        translate([x0, y_ini, z0])
            cube([huella, ancho, esp_peldano]);
    }

    color([0.45,0.45,0.48]) {
        for(i = [0:num_peldanos-1]){
            xp = x_fin - i * huella - huella/2;
            zp = z_llegada - i * alzada;

            translate([xp, y_bar_izq, zp])
                cylinder(h=h_bar, d=poste_d, $fn=20);
            translate([xp, y_bar_der, zp])
                cylinder(h=h_bar, d=poste_d, $fn=20);
        }

        translate([x_fin, y_bar_izq, z_llegada + esp_peldano])
            cylinder(h=h_bar, d=poste_d, $fn=20);
        translate([x_fin, y_bar_der, z_llegada + esp_peldano])
            cylinder(h=h_bar, d=poste_d, $fn=20);

        translate([x_ini, y_bar_izq, esp_peldano])
            cylinder(h=h_bar, d=poste_d, $fn=20);
        translate([x_ini, y_bar_der, esp_peldano])
            cylinder(h=h_bar, d=poste_d, $fn=20);
    }

    color([0.72,0.72,0.74]) {
        for(i = [0:num_peldanos-2]){
            p1_izq = [x_fin - i * huella - huella/2, y_bar_izq, z_llegada - i * alzada + h_bar];
            p2_izq = [x_fin - (i + 1) * huella - huella/2, y_bar_izq, z_llegada - (i + 1) * alzada + h_bar];
            pasamanos_tramo(p1_izq, p2_izq, d=pasamanos_d);

            p1_der = [x_fin - i * huella - huella/2, y_bar_der, z_llegada - i * alzada + h_bar];
            p2_der = [x_fin - (i + 1) * huella - huella/2, y_bar_der, z_llegada - (i + 1) * alzada + h_bar];
            pasamanos_tramo(p1_der, p2_der, d=pasamanos_d);
        }

        pasamanos_tramo(
            [x_fin, y_bar_izq, z_llegada + esp_peldano + h_bar],
            [x_fin - huella/2, y_bar_izq, z_llegada + h_bar],
            d=pasamanos_d
        );

        pasamanos_tramo(
            [x_fin, y_bar_der, z_llegada + esp_peldano + h_bar],
            [x_fin - huella/2, y_bar_der, z_llegada + h_bar],
            d=pasamanos_d
        );

        pasamanos_tramo(
            [x_ini + huella/2, y_bar_izq, z_llegada - (num_peldanos - 1) * alzada + h_bar],
            [x_ini, y_bar_izq, esp_peldano + h_bar],
            d=pasamanos_d
        );

        pasamanos_tramo(
            [x_ini + huella/2, y_bar_der, z_llegada - (num_peldanos - 1) * alzada + h_bar],
            [x_ini, y_bar_der, esp_peldano + h_bar],
            d=pasamanos_d
        );
    }
}
