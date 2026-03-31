# Guia De Construccion De La Estructura

Guia de obra y montaje basada en el modelo actual.

Objetivo:
- montar la estructura interior por fases
- comprobar que entra en la vivienda
- evitar olvidos de replanteo, soldadura y montaje

Importante:
- esta guia no sustituye un calculo estructural ni un plano de taller
- las paredes y la cocina existente no se tocan
- conviene confirmar niveles y escuadras reales antes de cortar todo el acero

## 1. Preparacion

### 1.1 Verificaciones previas

- medir otra vez la habitacion terminada
- comprobar posicion real de puertas, cocina y obstaculos
- comprobar si el suelo admite bien las placas base en los puntos previstos
- decidir si las uniones van soldadas en taller, atornilladas en obra o mixtas
- revisar tolerancias de entrada de piezas por puerta y escalera

### 1.2 Documentacion de apoyo

- [despiece_estructura.md](C:/Users/enriq/Desktop/palencia_30/cerrajero/2026-03-25/despiece_estructura.md)
- [01_parametros.scad](C:/Users/enriq/Desktop/palencia_30/cerrajero/2026-03-25/01_parametros.scad)
- [05_cotas.scad](C:/Users/enriq/Desktop/palencia_30/cerrajero/2026-03-25/05_cotas.scad)
- [06_capas_estructura.scad](C:/Users/enriq/Desktop/palencia_30/cerrajero/2026-03-25/06_capas_estructura.scad)
- [07_capas_detalle.scad](C:/Users/enriq/Desktop/palencia_30/cerrajero/2026-03-25/07_capas_detalle.scad)

## 2. Orden Recomendado De Fabricacion

### 2.1 Taller

- cortar pilares, vigas y secundarios
- preparar placas base
- preparar cartelas
- marcar cada pieza con su codigo del despiece
- presentar en banco los marcos principales para revisar escuadra

### 2.2 Acabado previo

- desbarbar cantos
- hacer taladros si hay uniones atornilladas
- dar imprimacion anticorrosion antes del montaje si compensa
- dejar sin pintar las zonas que se vayan a soldar en obra

## 3. Orden Recomendado De Montaje

### 3.1 Replanteo en suelo

- marcar el perimetro de la plataforma inferior
- marcar el perimetro de la cama superior
- marcar ejes de pilares
- comprobar que se mantiene paso libre respecto a cocina, escalera y puertas

### 3.2 Montaje de la plataforma inferior

- colocar placas base de `Z1-B1` a `Z1-B4`
- presentar pilares `Z1-P1` a `Z1-P4`
- nivelar y aplomar los cuatro pilares
- montar las vigas `Z1-V1` a `Z1-V4`
- comprobar diagonales del marco inferior
- soldar o atornillar definitivamente cuando la geometria este cerrada

### 3.3 Secundarios de la plataforma inferior

- colocar `Z1-S1` y `Z1-S2`
- revisar que quedan a la cota correcta respecto al tablero previsto
- montar las cartelas de zona 1 que se hayan mantenido en proyecto

### 3.4 Montaje de la cama / plataforma superior

- colocar pilares vistos `Z2-P1` y `Z2-P2`
- colocar apoyos cortos `Z2-A1` y `Z2-A2`
- presentar vigas `Z2-V1` a `Z2-V4`
- cerrar el marco superior
- comprobar aplomado de pilares y paralelismo entre plataforma inferior y superior

### 3.5 Secundarios de la cama

- colocar `Z2-S1`, `Z2-S2` y `Z2-S3`
- comprobar que el reparto sirve para el tablero final
- montar cartelas activas de la zona 2

### 3.6 Paso entre plataformas

- colocar `Z3-R1` y `Z3-R2`
- colocar `Z3-T1`
- revisar que el remate no invade los pasos

## 4. Tableros Y Elementos Superiores

- montar tablero estructural de la plataforma inferior
- montar tablero estructural de la cama
- montar base de colchon
- montar colchon
- montar tablero del despacho
- comprobar que la estructura no vibra de forma excesiva antes de rematar

## 5. Barandillas Y Remates

- montar barandilla del despacho bajo tablero
- montar barandillas de cama
- comprobar alturas y separaciones de seguridad
- rematar soldaduras vistas
- repasar imprimacion y pintura final

## 6. Comprobaciones Durante El Montaje

### 6.1 Geometria

- aplomado de todos los pilares
- nivel de las dos plataformas
- diagonales de marcos
- coincidencia real entre piezas y modelo

### 6.2 Uso

- paso libre de la escalera
- paso libre hacia la cama
- no invadir puertas ni cocina
- comprobar que escritorio, colchon y barandillas siguen teniendo sitio

### 6.3 Estructura

- revisar soldaduras
- revisar tornilleria
- revisar apoyo completo de placas base
- revisar que las cartelas no molestan al uso

## 7. Riesgos Y Cosas A No Olvidar

- no cortar todo el acero sin replanteo final en obra
- no confiar en que todas las paredes esten a escuadra
- no soldar definitivo antes de verificar diagonales y cotas
- no olvidarse del espesor de tableros y acabados al cerrar alturas
- no dejar la estructura terminada sin imprimacion o proteccion final

## 8. Pendientes Antes De Darlo Por Cerrado

- definir uniones exactas
- confirmar si alguna pieza conviene partir para entrada en vivienda
- confirmar anclaje real al suelo existente
- revisar si hace falta algun rigidizador extra tras el montaje en seco
