# Explorador CEO · Prospectiva

Aplicación local para comparar perfiles de encuestas. Interfaz en catalán; HTML, CSS y JavaScript sin dependencias, servicios externos ni instalación.

## Novedades de la versión 1.6

Debajo de la tabla, **Edita les notes** despliega un editor de título y texto, tipografía, tamaño (8–24 pt), color, negrita y cursiva. El formato se aplica al bloque completo de notas. El título es opcional. El texto predeterminado se actualiza con el análisis hasta que lo personalizas; el texto personalizado se mantiene al modificar los filtros.

**Oculta les notes** elimina el bloque de la vista y de las exportaciones sin perder el texto; **Mostra les notes** lo recupera. Dejar el texto vacío también elimina el bloque, incluido su encabezado. **Restableix les notes predeterminades** recupera el texto automático y el formato inicial. Los cambios se guardan en el JSON del análisis, con compatibilidad para configuraciones antiguas.

Word, HTML, PDF y la copia enriquecida reciben el formato. CSV y copia como texto conservan solo el contenido. La tipografía utiliza las fuentes instaladas en el equipo; si falta alguna, el programa que abre el informe puede sustituirla. Los avisos de cálculo de la aplicación siguen visibles aunque ocultes las notas.

## Ajuste visual de la versión 1.5.2

El nombre de cada indicador numérico se distingue con fondo rojo suave, texto rojo oscuro y negrita. Los valores se mantienen en la misma fila sobre blanco. El estilo se aplica en pantalla, Word y HTML/PDF. El CSV conserva su formato de texto.

## Novedades de la versión 1.5.1

Las variables numéricas ocupan una sola fila: nombre del indicador y estadístico (media o mediana) en la primera celda y resultados en las siguientes. Cada resultado conserva la base válida como `n = ...`. Los casos ausentes y los pesos inválidos se detallan en las notas cuando existen y, en pantalla, al situar el cursor sobre la celda. Las variables pendientes de confirmar la orientación muestran el aviso sin calcular resultados.

Este formato se aplica en pantalla, CSV, copia, HTML, PDF y Word, con cualquier orientación. Las variables categóricas conservan sus filas de categorías y bases. Se han probado medias, medianas, ausentes, pesos inválidos, diferencias y tablas divididas con datos sintéticos. La revisión visual sigue pendiente.

## Novedades de la versión 1.5

El selector **Format de l'informe**, junto a las exportaciones, permite elegir A4 automático, vertical u horizontal. En automático, hasta tres columnas de resultados se presentan en vertical; con más columnas se utiliza horizontal. Se cuenta la columna de diferencias cuando está activa.

En horizontal caben hasta ocho columnas de resultados más la columna de etiquetas, con letra de tabla de 9 pt; en vertical se mantienen tres columnas de resultados y 10 pt. Si hay más, se distribuyen en varias tablas sin perder grupos. La diferencia permanece junto a los dos grupos a los que se refiere. Word, HTML y PDF utilizan la orientación elegida; el CSV mantiene todos los grupos en una sola tabla. La preferencia se guarda con el análisis y los JSON anteriores siguen siendo compatibles.

Las dimensiones, el reparto de columnas, los textos y la orientación se comprueban mediante pruebas automatizadas. La revisión visual en Word/PDF sigue pendiente. Si el diálogo de impresión conserva otro ajuste, selecciona la orientación elegida en la aplicación.

## Corrección y diseño de la versión 1.4.2

- El encabezado reúne los meses de un mismo REO y año en una línea. Por ejemplo: `REO: 1169 · MES: Setembre–Octubre · ANY: 2026`. No presenta cada mes como si fuera un estudio diferente.
- Ordena los meses cronológicamente y unifica meses numéricos y etiquetas equivalentes. Los meses no consecutivos se enumeran sin inventar meses intermedios; los años y los REO distintos siguen separados.
- La aplicación pasa a llamarse **Prospectiva**, con el color principal **#DB2828**, fondos rojos suaves y cabeceras de informe coordinadas en Word, HTML y PDF. Se conserva A4 vertical.
- El filtro REO sigue disponible como opción. La agrupación de fechas modifica la presentación y no elimina entrevistas ni cambia los cálculos.

## Corrección de la versión 1.4.1

El encabezado REO/MES/ANY se calcula de nuevo con las entrevistas incluidas en los grupos tras aplicar los filtros generales. Ya no enumera automáticamente todos los estudios del archivo si algunos quedan fuera del análisis. Si no queda ninguna entrevista, se indica expresamente y no se recupera la fecha de otra oleada.

En «Delimita la mostra», el selector **Onada · REO** permite elegir una oleada del archivo. La selección se refleja en un filtro general y afecta tanto a los cálculos como al encabezado. Los otros filtros se conservan. «Totes les onades del fitxer» elimina los filtros generales de REO; los filtros específicos de los grupos se mantienen. Si la tabla incluye realmente varias oleadas, se siguen mostrando todas con sus fechas correspondientes.

No se deduce el REO por el nombre del archivo ni se eliminan entrevistas al cargarlo. Se ha probado el caso 1167/1169 con datos sintéticos, selección de REO, filtros de grupos, muestra vacía, recarga de archivos y exportaciones. No se ha podido inspeccionar el contenido del CSV real ni hacer una revisión visual.

## Novedades de la versión 1.4

**Matriu de transferències** crea los grupos automáticamente. Carga el CSV, pulsa este botón en «Construeix els grups» y elige origen (recuerdo) y destino (intención). Todas las categorías válidas de origen presentes en la muestra filtrada se seleccionan inicialmente; puedes desmarcar las que no necesites. Pulsa «Crea la matriu».

Se sustituyen grupos e indicadores y se oculta la diferencia entre los dos primeros grupos. Se conservan filtros generales, peso y denominador. Las columnas representan el origen y las filas el destino; los porcentajes se leen por columnas. Los grupos creados siguen siendo editables en «Veure / editar els grups». Se admiten hasta 50 grupos y pueden guardarse y restaurarse como cualquier análisis. Para recoger nuevas categorías de otra oleada, vuelve a crear la matriz después de cargarla.

El asistente utiliza las categorías recodificadas del diccionario; muestra cuántos casos no tienen origen válido. No recupera automáticamente abstención, indecisión o no respuesta si están marcadas como ausentes: revisa su tratamiento en el diccionario. Si existen varias variables de recuerdo, el asistente pide elegir una. También se pueden cruzar otras dos variables categóricas de respuesta única.

Las exportaciones conservan REO/MES/ANY. El CSV incluye toda la matriz; Word, HTML y PDF distribuyen las columnas en varias tablas A4 verticales. Hay pruebas automatizadas con casos sintéticos para los grupos, filtros, recodificaciones, porcentajes y la integración del asistente. No se ha realizado validación visual en navegador.

## Novedades de la versión 1.3

- El encabezado de la tabla muestra **REO, MES y ANY** del CSV cargado. Se incluye en Word, HTML, PDF, CSV y al copiar la tabla, tanto en texto como en formato enriquecido.
- Los meses numéricos de 1 a 12 se presentan con su nombre en catalán. Las etiquetas de mes del CSV se conservan; los datos ausentes se indican como «no disponible».
- Si hay varias combinaciones de REO, MES y ANY, se enumeran sin mezclar los meses y años de distintas filas. Desde la versión 1.4.1 identifican las entrevistas incluidas en los grupos de la tabla; los filtros del análisis siguen documentados en las notas. Si el informe se divide en varias tablas, cada una incluye el encabezado.
- Estos datos se actualizan al cargar otra oleada y no se sustituyen al importar una configuración guardada. Las recodificaciones del diccionario no alteran la identificación del estudio.

## Novedades de la versión 1.2

- **Word ↓** descarga `comparacio_ceo.docx`: documento Word nativo con título, celdas y notas editables, sin capturas ni conversión de HTML con una extensión falsa.
- **A4 vertical** en Word, HTML y PDF. Márgenes de 18 mm en el informe; la tabla se ajusta al ancho disponible.
- El PDF se imprime desde un informe independiente de la interfaz, evitando incluir controles o recortar el título.
- Las cabeceras se configuran para repetirse al continuar la tabla en otra página; las filas se mantienen juntas cuando caben en una página.
- Si hay más de tres columnas de resultados, se distribuyen los grupos en varias tablas. La diferencia permanece junto a los dos primeros grupos y todos los demás se conservan en las siguientes tablas. No se reduce la letra para encajar ocho columnas en una página vertical.
- El nuevo archivo `report-export.js` debe acompañar a `index.html`, `app.js` y `styles.css`, también al subir el proyecto a GitHub.

Para actualizar una carpeta existente, guarda primero la configuración abierta como JSON, copia el contenido de esta carpeta sobre la anterior y recarga la página. No borres la carpeta `.git`. Las configuraciones JSON de las versiones anteriores siguen siendo compatibles.

En Word puedes añadir párrafos antes o después de la tabla, cambiar fuente, colores y bordes, o copiarla a otro documento. Al integrarla, el ancho y la orientación pasan a depender también de la sección de destino.

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
- **Word:** archivo `.docx` nativo con tabla y texto editables. Se genera localmente y no depende de una conexión a Internet.
- **PDF / Imprimeix:** abre la impresión del informe en el navegador; elige «Guardar como PDF». El diseño utiliza A4 y la orientación del selector «Format de l’informe». Si el diálogo conserva una preferencia anterior, ajústala para que coincida. Puedes desactivar las cabeceras y pies del navegador para evitar añadir fecha o URL.

Las notas incluyen el archivo fuente, filtros, definiciones de grupos, denominadores y ponderación. Puedes editar el título de la tabla antes de exportar.

## Archivos del proyecto

| Archivo | Función |
| --- | --- |
| `index.html` | Estructura de la interfaz |
| `styles.css` | Diseño, adaptación a pantallas pequeñas e impresión |
| `engine.js` | Lectura de CSV, diccionario base y cálculos descriptivos |
| `app.js` | Controles, editor, configuraciones y exportaciones |
| `report-export.js` | Informe HTML/PDF y generación de DOCX editable en A4 vertical |
| `tests/engine.test.js` | Pruebas de cálculo y lectura de archivos |
| `tests/metadata.test.js` | Identificación de estudios, fechas y campos ausentes |
| `tests/editor.test.js` | Estado del editor e integración de exportaciones con DOM simulado |
| `tests/report.test.js` | ZIP de DOCX, estructura, orientación y distribución de tablas |
| `package.json` | Comando de pruebas, sin dependencias |

Para ejecutar las pruebas con Node.js instalado: `npm test` o `node tests/engine.test.js`. No necesitas Node para usar la aplicación.

## Validación de esta entrega

En la versión 1.3 se han comprobado los encabezados en CSV, HTML/PDF, Word y portapapeles, la actualización al cambiar de oleada e importar una configuración, los datos ausentes y las combinaciones de estudios y fechas. Son pruebas automatizadas; no se ha realizado una nueva revisión visual en Word o en el navegador.

Se han superado 14 pruebas automatizadas del motor con casos sintéticos: CSV con comillas y saltos de línea, rechazo de registros inconsistentes, códigos/etiquetas, extremos de escalas, no respuesta, bases, pesos, denominadores, filtros, recodificación, respuesta múltiple, bloqueo de orientación, escapado de exportaciones, escalas de líderes, diagnóstico y restauración de valores. También se ha probado el estado del editor (restablecer en borrador, cancelar, aplicar y mostrar diagnóstico) con un DOM simulado. Se ha comprobado la sintaxis de JavaScript. Estas pruebas no sustituyen la revisión visual en un navegador.

En la versión 1.2 se han superado otras 7 pruebas de exportación: ZIP y CRC, relaciones de DOCX, orientación vertical, ancho de tabla, cabeceras, celdas editables, escapado de texto y distribución de hasta seis grupos. Se ha comprobado la integración con la tabla del análisis y se han analizado las siete partes XML con un parser independiente. El runtime de renderizado de documentos no estuvo disponible, por lo que no se ha verificado visualmente el resultado en Word ni en PDF. La paginación final puede variar entre Word, LibreOffice y el navegador.

La descarga de `REO1169_microdades_anonimitzades.csv` falló en el entorno de elaboración por un error de resolución de red. No se han inspeccionado sus filas ni validado los resultados contra los n=142 y n=119 de la tabla de referencia. El archivo real no se incluye en el ZIP. El navegador de pruebas tampoco estuvo disponible, por lo que queda pendiente la comprobación visual y funcional en un navegador real. Son limitaciones de validación, no resultados que deban darse por comprobados.

Primera comprobación recomendada: carga tu CSV, aplica la plantilla y compara los tamaños de grupo y las bases válidas con la tabla original. Si difieren, revisa etiquetas, filtros territoriales y universo antes de interpretar diferencias sustantivas.

## Privacidad y persistencia

Los microdatos se procesan en memoria en tu navegador. El botón «Carrega CEO · REO1169» descarga el CSV publicado; requiere conexión. La carga manual y el análisis se realizan localmente. No hay analítica, CDN ni subida de microdatos desde la aplicación. Al recargar o cerrar la página se pierden los datos y la configuración no exportada. Guarda el JSON para conservar tu trabajo y vuelve a cargar el CSV cuando lo necesites.

## Nombre de las descargas (v1.7)

El campo «Nom del fitxer», junto a los botones de exportación, permite elegir un nombre común para CSV, HTML, Word y el JSON de «Desa l’anàlisi». La extensión se añade automáticamente. El nombre se guarda con el análisis; las configuraciones anteriores usan `comparacio_ceo`. Se conservan acentos y espacios, se sustituyen los caracteres incompatibles con Windows y los nombres vacíos vuelven al predeterminado. El título visible de la tabla se configura por separado.

En PDF se propone el nombre mediante el título de impresión; el navegador o el controlador de impresión puede elegir otro nombre, que se puede cambiar en el diálogo de guardado.

## Carga del CEO publicado (v1.8)

Sube `REO1169_microdades_anonimitzades.csv`, con ese nombre exacto, a la misma carpeta publicada que `index.html`. El botón **Carrega CEO · REO1169** intenta primero descargar el archivo público de la raíz de `main` mediante raw.githubusercontent.com; si falla, prueba la carpeta publicada junto a `index.html`. Espera a que termine la publicación de GitHub Pages tras subirlo.

Si abres `index.html` mediante doble clic (`file://`), el botón descarga la versión de la raíz de la rama `main` de `PauBelloPerez/Prospectiva-BCN` mediante raw.githubusercontent.com. Esa ruta debe ser accesible públicamente. Con un servidor local (por ejemplo Live Server), coloca el CSV junto a `index.html`.

La carga del CSV publicado detecta automáticamente codificación y separador. Los selectores se aplican solo a la carga manual. Una carga correcta inicia un nuevo análisis; un error de red o de lectura conserva el actual. Puedes seguir cargando cualquier otra oleada con «Carrega CSV». Para actualizar el acceso directo a otra oleada, cambia `PUBLISHED_CSV` en `app.js` y las etiquetas REO del botón en `index.html` y `app.js`.

Se han probado descargas simuladas, errores, codificación y cargas simultáneas. El CSV real no se incluye en este ZIP y queda pendiente verificar su descarga cuando esté publicado.

### Corrección v1.8.1

La descarga directa desde GitHub también se usa desde la web, con la ruta junto a `index.html` como alternativa. Cada intento tiene un límite de 20 segundos; los errores identifican el origen y el fallo. Se añaden versiones a los recursos de la página para renovar la caché tras actualizar.

Se ha comprobado que el CSV presente en la carpeta local del proyecto se lee como Windows-1252, separado por punto y coma, con 2.000 entrevistas y 320 variables. Esta comprobación valida la lectura del fichero, no la publicación ni el acceso de red real a GitHub.

## Orden manual de filas y columnas (v1.9)

Encima de la tabla, abre **Ordena files i columnes**. En «Columnes · grups», mueve cada grupo con las flechas o elige su posición (1 = primera columna de resultados). Los filtros y las bases siguen perteneciendo al mismo grupo. En «Files», elige una variable para ordenar sus respuestas, o «Indicadors (blocs de files)» para mover variables completas, incluidas las numéricas. Las flechas permiten mover una posición; el selector permite llevar un partido directamente al principio.

El orden se guarda mediante «Desa l’anàlisi» y se mantiene en CSV, Word, PDF, HTML y al copiar. Las categorías nuevas se añaden al final; las ocultas por filtros recuperan su posición al quitar el filtro. Las recodificaciones que cambian la clave de una categoría se consideran categorías nuevas. «Restableix l’ordre de les respostes» recupera el orden predeterminado de la variable seleccionada. Los archivos JSON anteriores siguen funcionando.

Si «Diferència» está activa, siempre compara el primer grupo menos el segundo. Reordenar esas columnas cambia también la comparación, indicada en el panel. En las matrices, las columnas son los grupos de origen y las filas las respuestas de destino; se ordenan por separado. El orden no altera los porcentajes ni las bases de cada grupo.
