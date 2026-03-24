// Proyecto dividido en archivos para facilitar su manejo.
// Diseno equivalente al original guardado en ../inicial/palencia30.scad

include <01_parametros.scad>;
include <02_modulos_basicos.scad>;
include <03_modulos_cartelas.scad>;
include <04_geometria_escalera.scad>;
include <05_cotas.scad>;
include <06_capas_estructura.scad>;
include <07_capas_detalle.scad>;
include <08_ensamblaje.scad>;

// =====================================================
// VISIBILIDAD EDITABLE A MANO
// Cambia true/false aqui sin tocar el resto de archivos.
// =====================================================
ver_pilares      = true;
ver_vigas        = true;
ver_secundarios  = true;
ver_suelo        = true;
ver_barandilla   = true;
ver_cartelas     = true;
ver_hueco        = false;
ver_placas_base  = true;
ver_escalera     = true;
ver_vol_esc      = false;
ver_etiquetas_pilares = false;
ver_cotas        = false;
ver_habitacion   = false;

ensamblaje();
