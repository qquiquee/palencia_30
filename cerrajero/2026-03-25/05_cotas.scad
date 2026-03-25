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

// Cama/plataforma superior aproximada, apoyada sobre estructura interior.
cama_nw = [esquina_noroeste[0] - estructura_retranqueo_muro, esquina_noroeste[1] - estructura_retranqueo_muro];
cama_ne_muro = punto_en_segmento(hab_pared_norte_a, hab_pared_norte_b, cama_largo);
cama_ne = [cama_ne_muro[0] - estructura_retranqueo_muro, cama_ne_muro[1]];
cama_sw_muro = punto_en_segmento(hab_pared_oeste_b, hab_pared_oeste_a, cama_fondo);
cama_sw = [cama_sw_muro[0], cama_sw_muro[1] - estructura_retranqueo_muro];
cama_se = [cama_ne[0] + (cama_sw[0] - cama_nw[0]), cama_ne[1] + (cama_sw[1] - cama_nw[1])];

// Puntos de referencia de pilares, ahora ligados a la geometria real.
p5_x = cama_nw[0];
p5_y = cama_nw[1];
p6_x = cama_ne[0];
p6_y = cama_ne[1];
p8_x = cama_sw[0];
p8_y = cama_sw[1];
p9_x = cama_se[0];
p9_y = cama_se[1];

// Plataforma inferior: arranca donde empieza la cama y baja hasta la pared este.
// Se construye casi como un rectangulo en la misma familia geometrica.
plataforma_grande_sw = punto_en_y(cama_sw, cama_se, estructura_retranqueo_muro);
plataforma_grande_se = [p9_x, p9_y];
plataforma_grande_ne = [p6_x, p6_y];
plataforma_grande_nw = [
    p6_x + (plataforma_grande_sw[0] - p9_x),
    p6_y + (plataforma_grande_sw[1] - p9_y)
];

// La escalera va pegada a la pared este, lo mas al sur posible, y apoya en la viga sur.
esc_recta_x_llegada = plataforma_grande_sw[0] + 260;
esc_recta_x_ini = esc_recta_x_llegada - esc_recta_largo;
esc_recta_y_ini = 0;
esc_recta_y_fin = ancho_escalera;
esc_recta_y_llegada = esc_recta_y_ini;

// Volumen de comprobacion de la escalera.
hueco_esc_x_min = esc_recta_x_ini;
hueco_esc_x_max = esc_recta_x_llegada;
hueco_esc_y_min = esc_recta_y_ini;
hueco_esc_y_max = esc_recta_y_fin;
