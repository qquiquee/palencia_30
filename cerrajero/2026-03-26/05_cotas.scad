// Cotas utiles

// Geometria real de la habitacion.
// Se mantiene el sistema XY historico del proyecto:
// - tramo superior => pared oeste
// - lateral izquierdo => pared sur
// - tramo inferior => pared este
// - lateral derecho => pared norte

x1_min = 0;
x1_max = L1;
y1_min = 0;
y1_max = W1;

x2_min = L1 - L2;
x2_max = L1;
y2_min = W1;
y2_max = W1 + W2;

x_p8 = x2_max - puerta_ancho - puerta_bano_sep/2;

z_viga_grande  = base_esp + altura_grande + pletina_cabeza_esp;
z_viga_pequena = base_esp + altura_pequena + pletina_cabeza_esp;

z_sup_grande  = z_viga_grande  + viga_h;
z_sup_pequena = z_viga_pequena + viga_h;

z_sec_grande  = z_sup_grande  - sec_h;
z_sec_pequena = z_sup_pequena - sec_h;

z_suelo_grande  = z_sup_grande  + tablero_esp + laminado_esp;
z_suelo_pequena = z_sup_pequena + tablero_esp + laminado_esp;

z_apoyo_sup = z_sup_grande;
h_apoyo_sup = altura_apoyo_corto;

z_bar_grande = z_suelo_grande;
z_bar_pequena = z_suelo_pequena;
h_barrotes = bar_h - rodapie_h - bar_pasamanos_h;

// Escalera recta prevista dentro de la reforma interior.
esc_recta_largo = esc_recta_huella * esc_recta_num_peldanos;
cocina_y_ini_fijo = W_hab - cocina_retorno;

// Perimetro de la habitacion segun medicion, desacoplado de la estructura.
hab_pared_sur_a = [0, 0];
hab_pared_sur_b = [0, pared_sur_largo];
hab_pared_oeste_a = hab_pared_sur_b;
hab_pared_oeste_b = [3829.958, 4161.889];
hab_pared_norte_a = hab_pared_oeste_b;
hab_pared_norte_b = [pared_este_largo, 0];
hab_pared_este_a = hab_pared_norte_b;
hab_pared_este_b = hab_pared_sur_a;

hab_contorno = [
    hab_pared_sur_a,
    hab_pared_sur_b,
    hab_pared_oeste_b,
    hab_pared_norte_b
];

// Referencia de la esquina de la puerta principal en la plataforma superior.
esquina_puerta_principal_x = x2_max;
esquina_puerta_principal_y = y2_max;

// Esquinas reales de la habitacion segun orientacion nombrada.
esquina_suroeste = hab_pared_sur_a;
esquina_noroeste = hab_pared_oeste_b;
esquina_noreste = hab_pared_norte_b;

// Dos plataformas rectangulares consecutivas, sin voladizos:
// - cama superior al oeste, de 1300 x 2100
// - plataforma inferior al este, de 1300 x lo que resta hasta la esquina noreste
cama_nw = esquina_noroeste;
cama_ne = punto_en_segmento(hab_pared_norte_a, hab_pared_norte_b, cama_largo);
cama_sw = punto_en_segmento(hab_pared_oeste_b, hab_pared_oeste_a, cama_fondo);
cama_se = [
    cama_ne[0] + (cama_sw[0] - cama_nw[0]),
    cama_ne[1] + (cama_sw[1] - cama_nw[1])
];

// Colchon visible sobre la cama superior.
cama_colchon_nw = cama_nw;
cama_colchon_ne = punto_en_segmento(cama_nw, cama_ne, cama_colchon_ancho);
cama_colchon_sw = punto_en_segmento(cama_nw, cama_sw, cama_colchon_largo);
cama_colchon_se = [
    cama_colchon_ne[0] + (cama_colchon_sw[0] - cama_colchon_nw[0]),
    cama_colchon_ne[1] + (cama_colchon_sw[1] - cama_colchon_nw[1])
];

// Base del colchon.
cama_base_nw = cama_colchon_nw;
cama_base_ne = cama_colchon_ne;
cama_base_sw = cama_colchon_sw;
cama_base_se = cama_colchon_se;

// Puntos de referencia de pilares:
// - p5 y p8 son los dos pilares altos de la cama superior
// - p6 y apoyo_cama son los pilares centrales de la plataforma baja
//   sobre los que apoyan las dos patas cortas de 400 mm
p5_x = cama_nw[0];
p5_y = cama_nw[1];
p6_x = cama_ne[0];
p6_y = cama_ne[1];
p8_x = cama_sw[0];
p8_y = cama_sw[1];
p9_x = cama_se[0];
p9_y = cama_se[1];

// Plataforma inferior: rectangulo de 1300 de fondo y largo hasta la pared este.
plataforma_grande_nw = cama_ne;
plataforma_grande_ne = esquina_noreste;
plataforma_grande_sw = cama_se;
plataforma_grande_se = [
    plataforma_grande_ne[0] + (cama_sw[0] - cama_nw[0]),
    plataforma_grande_ne[1] + (cama_sw[1] - cama_nw[1])
];

// Escalon de acceso desde el despacho a la cama superior.
escalon_union_p0 = interpola_punto(plataforma_grande_ne, plataforma_grande_nw, 0.28);
escalon_union_p1 = interpola_punto(plataforma_grande_ne, plataforma_grande_nw, 0.68);
escalon_cama_p0 = interpola_punto(escalon_union_p0, cama_base_sw, 0.18);
escalon_cama_p1 = interpola_punto(escalon_union_p1, cama_base_se, 0.18);
escalon_cama_p0_in = punto_en_segmento(escalon_cama_p0, cama_base_nw, escalon_cama_fondo);
escalon_cama_p1_in = punto_en_segmento(escalon_cama_p1, cama_base_ne, escalon_cama_fondo);

// La escalera va pegada a la pared este, lo mas al sur posible, y apoya en la viga sur.
esc_recta_x_llegada = (plataforma_grande_sw[0] + plataforma_grande_se[0]) / 2;
esc_recta_x_ini = esc_recta_x_llegada - esc_recta_largo;
esc_recta_y_ini = 0;
esc_recta_y_fin = ancho_escalera;
esc_recta_y_llegada = esc_recta_y_ini;

// Volumen de comprobacion de la escalera.
hueco_esc_x_min = esc_recta_x_ini;
hueco_esc_x_max = esc_recta_x_llegada;
hueco_esc_y_min = esc_recta_y_ini;
hueco_esc_y_max = esc_recta_y_fin;

// Los dos apoyos cortos de la cama coinciden con los pilares centrales de la plataforma baja.
apoyo_cama_x = plataforma_grande_sw[0];
apoyo_cama_y = plataforma_grande_sw[1];

// Despacho: tablero simple de 700x1400 pegado a la viga sur y al lado de la cama.
desk_desplazamiento_sur = -500;
desk_base_sur = punto_en_segmento(plataforma_grande_se, plataforma_grande_ne, desk_desplazamiento_sur);
desk_p0 = desk_base_sur;
desk_p1 = punto_en_segmento(desk_base_sur, [desk_base_sur[0] + (plataforma_grande_sw[0] - plataforma_grande_se[0]), desk_base_sur[1] + (plataforma_grande_sw[1] - plataforma_grande_se[1])], despacho_tablero_largo);
desk_p0_in = punto_en_segmento(desk_base_sur, [desk_base_sur[0] + (plataforma_grande_ne[0] - plataforma_grande_se[0]), desk_base_sur[1] + (plataforma_grande_ne[1] - plataforma_grande_se[1])], despacho_tablero_ancho);
desk_p1_in = punto_en_segmento(
    desk_p1,
    [
        desk_p1[0] + (plataforma_grande_ne[0] - plataforma_grande_se[0]),
        desk_p1[1] + (plataforma_grande_ne[1] - plataforma_grande_se[1])
    ],
    despacho_tablero_ancho
);
