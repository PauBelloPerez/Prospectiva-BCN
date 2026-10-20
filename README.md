# Explorador CEO · Observatori

Aplicación local para comparar perfiles de encuestas. Interfaz en catalán; HTML, CSS y JavaScript sin dependencias, servicios externos ni instalación.

## Novedades de la versión 1.1

- **Restableix valors predeterminats** en el editor de cada variable: recupera el diccionario de partida de la aplicación (tipo, etiquetas, rango, exclusiones y orientación). Los datos originales del CSV nunca se modifican. Pulsa **Aplica els canvis** para confirmar el restablecimiento; cerrar la ventana lo cancela. Revisa los filtros que utilizaran categorías agrupadas, porque no se reescriben automáticamente.
- Las escalas de valoración de líderes como `VAL_S_ILLA_0_10` reconocen **Molt deficient = 0** y **Excel·lent = 10**. Las configuraciones antiguas reciben los nuevos alias al importarlas, conservando tus recodificaciones explícitas; si habías excluido manualmente esos extremos, restaura esa variable y vuelve a aplicar.
- Los avisos muestran ejemplos concretos de valores desconocidos, sus frecuencias en el archivo y un botón para abrir la variable. El editor resalta las filas que requieren revisión. El recuento diagnóstico es del archivo completo; las bases de la tabla corresponden a los grupos filtrados.
- La escala espanyolisme–catalanisme mantiene la comprobación de orientación: no se ha supuesto que el CSV esté o no armonizado.

Para agrupar estudios, sí: asigna **Universitaris** a todas las categorías que quieras reunir y **No universitaris** a las restantes categorías válidas que correspondan, y pulsa **Aplica els canvis**. La tabla suma sus frecuencias y calcula el porcentaje conjunto. No reclasifiques automáticamente «No ho sap», «No contesta» o categorías ambiguas como no universitarios.

## Abrir y trabajar

1. Extrae el ZIP completo.
2. Abre la carpeta `ceo-explorador` en VSCode si quieres editar el código.
3. Abre `index.html` en un navegador moderno. También funciona con un servidor local de VSCode.
4. Pulsa **Carrega CSV** y selecciona tu archivo de microdatos. Si los acentos no se ven bien, elige la codificación y vuelve a cargar el archivo.
5. Define los filtros generales, los grupos y los indicadores.
6. Revisa las variables en **Diccionari i recodificacions** y exporta la tabla.

El botón **Explorar un exemple** carga datos sintéticos creados únicamente para probar la aplicación. No son resultados del CEO.

## Reproducir PSC → ERC / ERC → PSC

Tras cargar el CSV, pulsa **Plantilla PSC ↔ ERC**. La plantilla utiliza `INT_PARLAMENT_VOT` y `INT_PARLAMENT_VOT2`; los grupos siguen siendo editables.

Se añaden los indicadores disponibles entre `IDEOL_0_10`, `ESP_CAT_0_10`, `EDAT_GR`, `ESTUDIS_1_15` y `LLOC_NAIX`. Si alguno no existe, no se inventa ni se sustituye automáticamente.

Para convertir estudios en universitarios/no universitarios, abre la variable en el diccionario y escribe la misma etiqueta de destino en las categorías que quieras agrupar. Revisa expresamente qué haces con «Altres» y con los títulos propios. La aplicación no impone esa decisión metodológica.

Los extremos «Extrema esquerra» y «Extrema dreta» se interpretan como 0 y 10 en las escalas ideológicas reconocidas. Las etiquetas nuevas que no se pueden convertir se contabilizan como no reconocidas y se señalan.

## Reutilizar en otras oleadas

El motor no depende de REO1169 ni de una lista fija de columnas:

- Descubre las columnas y valores que contiene cada archivo.
- Reconoce un conjunto inicial, revisable, de nombres y etiquetas habituales del CEO.
- Mantiene las variables nuevas como categóricas hasta que se define su tipo en el diccionario. No calcula medias de códigos de partidos o estudios.
- Acepta CSV con etiquetas o códigos, separadores coma/punto y coma/tabulador, campos entrecomillados, UTF-8 y Windows-1252.
- **Desa l’anàlisi** exporta filtros, grupos, indicadores, diccionario y recodificaciones en JSON. No exporta las entrevistas. Puede contener nombres de archivo y etiquetas observadas, incluidos textos que hayas utilizado en recodificaciones: revisa ese JSON antes de compartirlo.
- Para una nueva ola, carga primero el nuevo CSV y después **Obre una anàlisi**. Si faltan columnas utilizadas, podrás asignar sus equivalentes. No se adivinan equivalencias semánticas.
- Los grupos que dependen de una columna eliminada se retiran; los filtros generales y el peso deben tener equivalencia antes de continuar. Así no se amplía silenciosamente la muestra ni se elimina una ponderación.
- Las categorías guardadas que no existen en la nueva ola permanecen señaladas. Revísalas: no se sustituyen por todas las categorías.

«Reutilizable» no significa que cualquier pregunta nueva quede interpretada automáticamente. Debes comprobar el cuestionario y la documentación de cada ola. Las diferencias de universo, modo de entrevista, pregunta, codificación y ponderación importan aunque los nombres de las variables coincidan. Esta versión analiza un archivo cada vez y no combina oleadas automáticamente.

## Escala espanyolisme–catalanisme

El cuestionario REO1169 (p. 14) aleatoriza los extremos entre dos mitades de la muestra. Eso no permite deducir si el CSV publicado ya está armonizado.

La aplicación bloquea las medias de `ESP_CAT_0_10` y su familia hasta que confirmas la orientación en el diccionario. Debes volver a confirmarla tras importar una configuración en otro archivo. Si el CSV ya está armonizado, no lo inviertas otra vez.

La opción de inversión manual aplica `mínimo + máximo − valor` a toda la columna. No resuelve escalas con orientaciones distintas por fila: en ese caso hay que armonizar el archivo con la variable de aleatorización y la documentación correspondientes antes de calcular la media.

## Criterios de cálculo

- **n del grupo:** número real de entrevistas que cumple sus filtros, sin ponderar.
- **Base válida del indicador:** entrevistas con respuesta válida y, si hay ponderación, peso numérico positivo.
- **Ausentes:** no respuesta, blancos, exclusiones configuradas y etiquetas numéricas desconocidas/fuera de rango entre las filas con peso válido. Los pesos inválidos se contabilizan aparte. Base válida + ausentes + pesos inválidos = n del grupo.
- **Media:** suma de valor × peso / suma de pesos entre respuestas válidas. Sin ponderación, todos los pesos son 1. Un 0 válido nunca se excluye por ser cero.
- **Mediana:** mediana ordinaria sin pesos; con ponderación, primer valor cuyo peso acumulado alcanza el 50%.
- **Porcentajes:** puedes usar respuestas válidas o todos los integrantes del grupo con peso válido como denominador. El número entre paréntesis es el recuento sin ponderar, entre esas filas elegibles. Con ponderación, no tiene por qué coincidir con el porcentaje multiplicado por n.
- **Pesos inválidos:** vacíos, no numéricos, cero o negativos. No se sustituyen por 1. No se selecciona ningún peso automáticamente.
- **Diferencias:** primer grupo menos segundo, calculadas antes de redondear. Puntos de escala para medias/medianas; puntos porcentuales para porcentajes.
- **Grupos solapados:** se advierte del solapamiento entre los dos primeros grupos. No se interpreta como comparación de muestras independientes.
- **Respuesta múltiple:** agrupa columnas de menciones de la misma pregunta; cada persona cuenta una sola vez por categoría. La suma puede superar 100%. La base válida es quien tiene alguna mención válida. Unifica las etiquetas de los campos antes de agruparlos. No uses esta función para una batería de variables sí/no.

No se calculan inferencia, intervalos de confianza ni errores de diseño muestral. Es una herramienta descriptiva.

## Exportaciones

- **Copia:** intenta copiar una tabla HTML y texto para pegar en Word o Google Docs; si el navegador lo impide, utiliza HTML o CSV.
- **CSV:** tabla con separador punto y coma, UTF-8 con BOM, bases y notas; se puede abrir en Excel. No es un archivo XLSX.
- **HTML:** informe autónomo con título, tabla, bases y notas. No necesita los archivos de la aplicación.
- **PDF / Imprimeix:** abre la impresión del navegador; elige «Guardar como PDF». El diseño de impresión es A4 horizontal.

Las notas incluyen el archivo fuente, filtros, definiciones de grupos, denominadores y ponderación. Puedes editar el título de la tabla antes de exportar.

## Archivos del proyecto

| Archivo | Función |
| --- | --- |
| `index.html` | Estructura de la interfaz |
| `styles.css` | Diseño, adaptación a pantallas pequeñas e impresión |
| `engine.js` | Lectura de CSV, diccionario base y cálculos descriptivos |
| `app.js` | Controles, editor, configuraciones y exportaciones |
| `tests/engine.test.js` | Pruebas de cálculo y lectura de archivos |
| `package.json` | Comando de pruebas, sin dependencias |

Para ejecutar las pruebas con Node.js instalado: `npm test` o `node tests/engine.test.js`. No necesitas Node para usar la aplicación.

## Validación de esta entrega

Se han superado 14 pruebas automatizadas del motor con casos sintéticos: CSV con comillas y saltos de línea, rechazo de registros inconsistentes, códigos/etiquetas, extremos de escalas, no respuesta, bases, pesos, denominadores, filtros, recodificación, respuesta múltiple, bloqueo de orientación, escapado de exportaciones, escalas de líderes, diagnóstico y restauración de valores. También se ha probado el estado del editor (restablecer en borrador, cancelar, aplicar y mostrar diagnóstico) con un DOM simulado. Se ha comprobado la sintaxis de JavaScript. Estas pruebas no sustituyen la revisión visual en un navegador.

La descarga de `REO1169_microdades_anonimitzades.csv` falló en el entorno de elaboración por un error de resolución de red. No se han inspeccionado sus filas ni validado los resultados contra los n=142 y n=119 de la tabla de referencia. El archivo real no se incluye en el ZIP. El navegador de pruebas tampoco estuvo disponible, por lo que queda pendiente la comprobación visual y funcional en un navegador real. Son limitaciones de validación, no resultados que deban darse por comprobados.

Primera comprobación recomendada: carga tu CSV, aplica la plantilla y compara los tamaños de grupo y las bases válidas con la tabla original. Si difieren, revisa etiquetas, filtros territoriales y universo antes de interpretar diferencias sustantivas.

## Privacidad y persistencia

Los microdatos se procesan en memoria en tu navegador. No hay llamadas de red, analítica, CDN ni subida de archivos en el código de la aplicación. Al recargar o cerrar la página se pierden los datos y la configuración no exportada. Guarda el JSON para conservar tu trabajo y vuelve a cargar el CSV cuando lo necesites.
