// Modulos de cartelas

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
