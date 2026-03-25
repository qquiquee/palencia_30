// Capa de cama visible

module capa_cama() {
    z_base_cama = z_suelo_pequena;

    color([0.84, 0.74, 0.48])
        translate([0, 0, z_base_cama])
            linear_extrude(height=cama_base_esp)
                polygon([
                    cama_base_nw,
                    cama_base_ne,
                    cama_base_se,
                    cama_base_sw
                ]);

    color([0.97, 0.91, 0.62])
        translate([0, 0, z_base_cama + cama_base_esp])
            linear_extrude(height=cama_colchon_esp)
                polygon([
                    cama_colchon_nw,
                    cama_colchon_ne,
                    cama_colchon_se,
                    cama_colchon_sw
                ]);
}
