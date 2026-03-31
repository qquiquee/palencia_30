# Despiece De Estructura

Despiece orientativo sacado del modelo OpenSCAD actual.

Notas:
- Las longitudes estan tomadas sobre eje de pieza en el modelo.
- Antes de fabricar conviene revisar cortes, ingletes, solapes, chapas de union y tolerancias de montaje.
- La cocina, paredes, tablero del despacho, barandillas y acabados no se incluyen aqui como estructura principal.

## Perfileria Base Adoptada

- Pilares principales: tubo `80x80x3 mm`
- Vigas principales: tubo `60x40x3 mm`
- Secundarios: tubo `60x40x2.5 mm`
- Cartelas: chapa `6 mm`
- Placas base: chapa `8 mm`

## Zona 1. Plataforma Inferior

### Pilares `80x80x3`

- `Z1-P1` pilar suroeste / central-sur `1600 mm`
- `Z1-P2` pilar sureste exterior `1600 mm`
- `Z1-P3` pilar noroeste / central-norte `1600 mm`
- `Z1-P4` pilar noreste exterior `1600 mm`

### Vigas Principales `120x60x3`

- `Z1-V1` viga sur `~2070 mm`
- `Z1-V2` viga norte `~2070 mm`
- `Z1-V3` viga oeste / central `1300 mm`
- `Z1-V4` viga este `1300 mm`

### Secundarios `60x40x2.5`

- `Z1-S1` secundario interior oeste `~2070 mm`
- `Z1-S2` secundario interior este `~2070 mm`

### Cartelas `6 mm`

- `Z1-C1` cartela esquina suroeste, hacia viga sur
- `Z1-C2` cartela esquina suroeste, hacia viga oeste
- `Z1-C3` cartela esquina noroeste, hacia viga oeste
- `Z1-C4` cartela esquina noroeste, hacia viga norte
- `Z1-C5` cartela esquina noreste, hacia viga norte
- `Z1-C6` cartela esquina noreste, hacia viga este

### Placas Base `8 mm`

- `Z1-B1` placa base pilar `Z1-P1`
- `Z1-B2` placa base pilar `Z1-P2`
- `Z1-B3` placa base pilar `Z1-P3`
- `Z1-B4` placa base pilar `Z1-P4`

## Zona 2. Cama / Plataforma Superior

### Pilares `80x80x3`

- `Z2-P1` pilar oeste-norte visto `2080 mm`
- `Z2-P2` pilar oeste-sur visto `2080 mm`

### Apoyos Superiores `80x80x3`

- `Z2-A1` apoyo superior noreste sobre plataforma inferior `400 mm`, con pletina inferior y superior `150x150x10`
- `Z2-A2` apoyo superior sureste sobre plataforma inferior `400 mm`, con pletina inferior y superior `150x150x10`

### Vigas Principales `120x60x3`

- `Z2-V1` viga norte `2100 mm`
- `Z2-V2` viga sur `2100 mm`
- `Z2-V3` viga oeste `1300 mm`
- `Z2-V4` viga este / apoyo sobre pilares centrales `1300 mm`

### Secundarios `60x40x2.5`

- `Z2-S1` secundario interior norte `2100 mm`
- `Z2-S2` secundario interior central `2100 mm`
- `Z2-S3` secundario interior sur `2100 mm`

### Cartelas `6 mm`

- `Z2-C1` cartela apoyo oeste de esquina, hacia viga oeste
- `Z2-C2` cartela apoyo oeste de esquina, hacia viga sur
- `Z2-C3` cartela apoyo intermedio norte, hacia viga norte
- `Z2-C4` cartela apoyo intermedio norte, hacia tramo `P5-P6`
- `Z2-C5` cartela apoyo noreste, hacia tramo `P6-apoyo sureste`
- `Z2-C6` cartela apoyo sureste, hacia viga sur
- `Z2-C7` cartela apoyo sureste, hacia tramo `P6-apoyo sureste`

### Placas Base `8 mm`

- `Z2-B1` placa base pilar `Z2-P1`
- `Z2-B2` placa base pilar `Z2-P2`

## Zona 3. Paso Entre Plataformas

### Rodapies

- `Z3-R1` rodapie longitudinal exterior
- `Z3-R2` rodapie longitudinal interior

### Tapa

- `Z3-T1` tapa superior del pequeno escalon / remate

Nota:
- Ahora mismo esta pieza funciona como pequeno escalon / remate entre plataformas.

## Zona 4. Elementos No Estructurales Modelados

- Base de colchon
- Colchon
- Tablero del despacho
- Silla
- Barandillas

## Vanos De Referencia Del Modelo

- Plataforma inferior: `1300 x ~2070 mm`
- Cama / plataforma superior: `1300 x 2100 mm`
- Separacion entre ejes de patas en el sentido longitudinal: `1300 mm` en el arranque de la cama y `~2070 mm` hacia la pared este
- Desnivel estructural entre caras superiores de vigas: `420 mm`
- Suelo previsto: tablero DM `30 mm` directamente sobre vigas y secundarios

## Pendientes De Revisar Antes De Fabricar

- Tipo exacto de uniones: soldadas, atornilladas o mixtas
- Tamano y posicion de chapas de union
- Nivelacion y anclaje de placas base al suelo existente
- Secuencia real de montaje dentro de la vivienda
- Si conviene mantener todas las cartelas actuales o simplificar alguna mas
