// Parametros generales (mm)

altura_grande  = 1600;
altura_pequena = 2000;

L_hab = 3460;
W_hab = 4200;
H_hab = 3500;
hab_muro_esp = 100;
puerta_ancho = 900;
puerta_alto  = 2000;
puerta_bano_sep   = 200;
puerta_bano_ancho = 700;
puerta_bano_alto  = 2000;
bano_fondo = 1600;

L1 = 3460;
W1 = 2200;   // plataforma grande

L2 = 2000;
W2 = 2000;   // plataforma pequena

pilar_ext = 80;
pilar_esp = 3;

viga_h   = 100;
viga_b   = 50;
viga_esp = 3;

sec_ext = 40;
sec_esp = 3;

// Cartelas
cartela_ala = 260;
cartela_esp = 8;
cartela_retr = 6;

base_lado = 160;
base_esp  = 10;
taladro_d = 18;
taladro_margen = 25;

// Escalera recta prevista
ancho_escalera = 800;
esc_recta_huella = 140;
esc_recta_num_peldanos = 9;
esc_recta_esp_peldano = 8;
esc_recta_zanca_b = 80;
esc_recta_zanca_h = 200;
esc_recta_poste_d = 16;
esc_recta_pasamanos_d = 35;

// Apertura libre de salida de escalera
salida_escalera = 700;

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

// Rodapie
rodapie_h = 150;
rodapie_esp = 3;

// Barrotes
barrote_ext = 20;
barrote_esp = 2;
barrote_sep_max = 120;

// Visibilidad de capas
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
ver_etiquetas_pilares = false;
ver_cotas        = false;
ver_habitacion   = true;
ver_techo        = true;
ver_cocina       = true;
ver_silueta      = false;

// Etiquetas de referencia
etiqueta_pilar_tam = 40;
etiqueta_pilar_esp = 2;
etiqueta_pilar_z   = 80;
etiqueta_pilar_dx  = 65;
etiqueta_pilar_dy  = 65;

// Cotas
cota_tam_texto = 40;
cota_esp       = 2;
cota_marca     = 35;
cota_sep       = 180;
cota_color     = [0.10, 0.25, 0.85];

// Cocina
cocina_fondo = 600;
cocina_fondo_altos = 350;
cocina_alto_cuerpo = 880;
cocina_encimera_esp = 30;
cocina_alto_zocalo = 100;
cocina_alto_columna = 2300;
cocina_alto_altos = 900;
cocina_z_inferior_altos = 1450;
cocina_lado_largo = 1800;
cocina_retorno = 1200;
cocina_modulos_frente = 3;

// Silueta humana de referencia
silueta_h = 1750;
silueta_cuerpo_d = 260;
silueta_cabeza_d = 220;

// Parametros escalera de caracol
esc_d_ext = 1100;
esc_radio_ext = esc_d_ext / 2;
esc_mastil_d = 140;
esc_h = altura_pequena + tablero_esp + laminado_esp;

// Escalera pensada desde arriba hacia abajo
esc_num_peldanos = 11;
esc_esp_peldano = 8;
esc_giro_total = 360;
esc_ancho_angular_peldano = 28;

// 1 = antihorario al bajar
// -1 = horario al bajar
esc_sentido = 1;

// El peldano superior apunta hacia la apertura libre
esc_ang_salida = 180;
esc_ang_inicio = esc_ang_salida;

esc_poste_ext_d = 16;
esc_pasamanos_d = 35;
