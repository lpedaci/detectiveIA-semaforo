# Semáforo del Pacto

Herramienta del Nivel 3 (Diseñador/a) de la actividad gamificada «Misión: Detective de la IA» (Programa de formación docente, 4.º año). Cada docente clasifica las tareas de una actividad de su materia según el lugar que le da a la IA (verde, amarillo o rojo), justifica cada decisión y obtiene un borrador del pacto de uso de IA para pegar en la plantilla del aula virtual.

Es un sitio estático, sin dependencias ni servidor. Comparte el diseño, los temas y los patrones de accesibilidad del tablero [detectiveIA](https://github.com/lpedaci/detectiveIA).

## Estructura

```
Semaforo/
├── index.html              Página (estructura y textos fijos)
├── assets/
│   ├── css/styles.css      Estilos, temas claro/oscuro y animaciones
│   ├── js/data.js          Contenido: tareas de ejemplo, formas de declarar, mensajes y límites
│   ├── js/app.js           Lógica del semáforo (sellos, guardado, arrastre, borrador, animaciones)
│   └── img/
│       ├── favicon.svg          Ícono de pestaña
│       ├── apple-touch-icon.png Ícono al guardar en el celular
│       └── og-image.png         Vista previa al compartir el enlace (1200×630)
├── .nojekyll               Indica a GitHub Pages que publique los archivos tal cual
├── .gitignore              Archivos locales que no se suben al repositorio
└── README.md
```

Lo único externo son las tipografías de Google Fonts (Special Elite, IBM Plex Sans e IBM Plex Mono); sin conexión, la página funciona igual con las tipografías del sistema.

## Cómo se usa

1. **Tu actividad.** Materia y año, nombre de la actividad y objetivo de aprendizaje.
2. **Clasificá las tareas.** Cada tarea va a un carril con los botones de color (o arrastrándola con el mouse) y lleva una línea que explica por qué.
   - **Verde:** la IA puede ayudar.
   - **Amarillo:** con declaración y límites.
   - **Rojo:** sin IA, lo hace el estudiante.
3. **Declaración y evaluación.** Cómo declara el estudiante el uso de IA y cómo se evalúa el trabajo.
4. **Tu borrador.** Lista de control con los criterios de la rúbrica y el texto del pacto listo para copiar.

La página arranca con nueve tareas de ejemplo (un informe de investigación). «Empezar de cero» las quita y conserva lo escrito en el paso 1.

## Reglas de los sellos

El panel fijo de arriba muestra cinco sellos. Tocar un sello pendiente lleva al primer campo que falta.

| Sello | Se consigue cuando | Criterio de la rúbrica |
|---|---|---|
| Objetivo | El objetivo de aprendizaje tiene al menos 15 caracteres | Pertinencia pedagógica |
| Tareas | No quedan tareas sin clasificar, hay al menos una en rojo y al menos una en verde o amarillo | Qué hace la IA y qué queda para el estudiante |
| Razones | Todas las tareas clasificadas tienen su porqué escrito | Uso crítico de la IA, con razones |
| Declaración | Hay al menos una forma de declarar marcada o escrita | Transparencia |
| Evaluación | La forma de evaluar tiene al menos 15 caracteres | Evaluabilidad |

- Con los cinco sellos, el sello del encabezado pasa de «EN BORRADOR» a «BORRADOR LISTO».
- Los sellos se recalculan en vivo: si se borra un dato, el sello vuelve a pendiente.
- Cada paso muestra su estado (Pendiente, En curso, Listo). El paso 2 necesita los sellos Tareas y Razones; el paso 3, Declaración y Evaluación; el paso 4, los cinco.
- El campo del porqué sin completar se ve con borde punteado y la etiqueta «Falta el porqué». El texto gris que aparece adentro es una ayuda, no una respuesta.

### Aviso de equilibrio

Debajo de los carriles hay una barra con la proporción de colores y un aviso que orienta la reflexión. No bloquea ningún sello:

- Con menos de tres tareas clasificadas, pide clasificar más.
- Sin ninguna tarea en rojo, pregunta qué parte debe practicar el estudiante por su cuenta.
- Con todo en rojo, pregunta dónde podría acompañar la IA.
- Con más del 70 % en verde, sugiere revisar si se sigue practicando la habilidad del objetivo.
- En los demás casos, indica cuántos porqués faltan.

## Cómo se guarda el avance

El avance se guarda en el `localStorage` del navegador (clave `semaforo-pacto-v1`):

- Se guarda solo, en cada clic y poco después de escribir.
- Persiste al cerrar la pestaña o apagar la computadora.
- Es **por navegador y por dispositivo**: lo cargado en el celular no aparece en la computadora.
- Se pierde en modo incógnito, al borrar los datos de navegación o al tocar «Reiniciar semáforo» (dos toques; vuelve al ejemplo y borra todos los campos).
- Si el navegador bloquea el almacenamiento, la página muestra un aviso de alerta y ofrece abrirse en una pestaña nueva.
- Si está incrustada en el aula virtual y el almacenamiento funciona, muestra un aviso informativo con el mismo enlace, porque algunos navegadores igual lo borran al cerrar.
- En el uso normal muestra un recordatorio de que el avance se guarda solo en ese navegador, con un botón «Entendido» que lo cierra para las próximas visitas (clave `semaforo-pacto-aviso`).
- El modo incógnito no se puede detectar de forma confiable: ahí el avance se guarda mientras la ventana esté abierta. Como cada ventana de incógnito arranca sin datos, el recordatorio vuelve a aparecer siempre.
- Si está abierta en dos pestañas, se sincroniza entre ellas.
- Lo guardado se valida al cargar: si los datos están dañados, la página arranca con el ejemplo.

No se envía ningún dato a ningún servidor. La entrega real se hace en el aula virtual, pegando el borrador en la plantilla del Nivel 3.

## Publicar con GitHub Pages

1. Subir el contenido de esta carpeta a un repositorio (`index.html`, `assets/`, `.nojekyll` y `README.md`).
2. En el repositorio: **Settings → Pages**.
3. En *Source* elegir **Deploy from a branch**, rama `main` (o la que corresponda) y carpeta `/ (root)`.
4. Guardar. A los pocos minutos queda disponible en `https://lpedaci.github.io/detectiveIA-semaforo/`.

Esa dirección también figura en las etiquetas `og:url` y `og:image` de `index.html`. Si el repositorio cambia de nombre, hay que corregirla ahí para que la vista previa al compartir el enlace muestre la imagen.

Si se publica en el mismo sitio que detectiveIA (por ejemplo, como una carpeta dentro de ese repositorio), las dos páginas comparten el tema claro u oscuro elegido.

## Vincularlo al LMS

**Opción recomendada: enlace (URL) que abre en ventana nueva.** En Moodle: *Agregar actividad o recurso → URL*, pegar la dirección de GitHub Pages y en *Apariencia* elegir «En ventana emergente» o «Nueva ventana». Así el navegador guarda el avance y el botón de copiar funciona sin restricciones.

**Opción incrustada (iframe).** Funciona, pero algunos navegadores (sobre todo Safari) limitan el almacenamiento de páginas incrustadas desde otro dominio, y el avance podría no conservarse. Si se incrusta, la página muestra un enlace «Abrir en pestaña nueva».

```html
<iframe src="https://lpedaci.github.io/detectiveIA-semaforo/" title="Semáforo del Pacto"
        width="100%" height="1200" style="border:0" loading="lazy"></iframe>
```

## Caché del navegador al actualizar

GitHub Pages permite que los navegadores guarden una copia de los archivos por unos minutos. Para que nadie vea una mezcla de versión nueva y vieja, `index.html` carga el CSS y el JS con un número de versión (`styles.css?v=...`, `app.js?v=...`, `data.js?v=...`). **Cada vez que se modifique un archivo de `assets/css` o `assets/js`, hay que cambiar ese número en los tres enlaces** (por ejemplo, con la fecha).

## Editar el contenido

El contenido está en `assets/js/data.js` (objeto `window.PACTO`). No hace falta tocar `app.js`:

- `EXAMPLE`: tareas de ejemplo y el carril en el que arrancan (`pool`, `g`, `y` o `r`).
- `DECL`: opciones de declaración del paso 3. Si se cambia un `id`, las marcas guardadas de esa opción se descartan.
- `LANE_NAMES`, `LANE_SHORT` y `WHY_HINT`: nombres de los carriles y texto de ayuda del porqué.
- `RADIO`: mensajes del panel al clasificar.
- `MAX`: largos máximos de cada campo y cantidad máxima de tareas (80).

Las condiciones de los sellos y los textos de la lista de control sí están en `app.js`, en la función `renderDerived` (arreglo `items`); el formato del borrador, en `buildText`.

## Borrador, copia e impresión

- «Copiar borrador» copia el texto al portapapeles. Si el navegador no lo permite (página incrustada o sin HTTPS), deja el texto seleccionado para copiarlo a mano.
- Los campos sin completar aparecen en el borrador como `[completar]`, y las tareas sin clasificar en una sección aparte.
- Al imprimir la página (Ctrl + P) sale solo el encabezado y el borrador completo.

## Tema y avisos

- Botón de modo oscuro / modo claro en el pie. La elección se guarda en el navegador (clave `detective-ia-theme`, la misma que usa detectiveIA); si no se elige, sigue la configuración del sistema.
- El aviso de expediente completo se descarta deslizándolo hacia un costado, tocándolo, o se cierra solo a los 5 segundos (espera si el mouse está encima).

## Accesibilidad y movimiento

- Contraste en modo claro y oscuro, y soporte del modo de alto contraste de Windows.
- Todo se puede hacer con teclado: los botones de color reemplazan al arrastre, y el foco vuelve a la misma tarea después de moverla o a la tarea vecina después de quitarla.
- En pantallas táctiles el asa de arrastre se oculta, porque el arrastre del navegador no funciona con el dedo; quedan los botones de color.
- Anuncios para lectores de pantalla en cada clasificación y en cada sello. Los colores nunca son la única señal: cada carril y cada botón llevan su nombre.
- Controles de 40 a 44 px y campos a 16 px para evitar el zoom automático de iOS.
- Animaciones desactivadas si la persona tiene activado «reducir movimiento».

## Referencias

MDN Web Docs. (s.f.). *Clipboard: writeText() method*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText

MDN Web Docs. (s.f.). *HTML Drag and Drop API*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

MDN Web Docs. (s.f.). *Window: localStorage property*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

WebKit. (2020, 24 de marzo). *Full third-party cookie blocking and more*. https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
