// Cotas utiles

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

// Escalera recta con un pequeño retranqueo para ganar descansillo
esc_recta_x_ini = x1_min;
esc_recta_x_fin = esc_recta_x_ini + ancho_escalera;
esc_recta_y_llegada = y1_min + 250;
esc_recta_largo = esc_recta_huella * esc_recta_num_peldanos;

// Hueco de escalera en plataforma baja
hueco_esc_x_min = esc_recta_x_ini;
hueco_esc_x_max = esc_recta_x_fin;
hueco_esc_y_min = esc_recta_y_llegada;
hueco_esc_y_max = hueco_esc_y_min + esc_recta_largo;
