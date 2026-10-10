/* =========================================================
   Contenido del semáforo: tareas de ejemplo, formas de declarar,
   nombres de los carriles, mensajes y límites.
   Es el único archivo que hace falta tocar para editar la actividad.
   Si cambiás el "id" de una opción de declaración, se descartan las marcas guardadas de esa opción.
   ========================================================= */
window.PACTO = (() => {
  // Tareas de ejemplo con las que arranca la página. "lane" es el carril inicial:
  // pool (sin clasificar), g (verde), y (amarillo) o r (rojo).
  const EXAMPLE = [
    { text: 'Explorar ideas para elegir el tema', lane: 'g' },
    { text: 'Buscar y seleccionar fuentes confiables', lane: 'pool' },
    { text: 'Resumir con sus palabras las ideas principales de cada fuente', lane: 'pool' },
    { text: 'Armar el esquema del informe', lane: 'pool' },
    { text: 'Redactar la introducción y el desarrollo', lane: 'pool' },
    { text: 'Escribir la conclusión con su propia opinión', lane: 'r' },
    { text: 'Revisar ortografía y claridad del texto', lane: 'y' },
    { text: 'Citar las fuentes en formato APA', lane: 'pool' },
    { text: 'Preparar y defender el informe oralmente', lane: 'pool' }
  ];

  // Opciones del paso 3: cómo declara el estudiante el uso de IA.
  const DECL = [
    { id: 'herr', label: 'Indicar qué herramienta usó y en qué fecha' },
    { id: 'prompt', label: 'Pegar las indicaciones (prompts) que le dio a la IA' },
    { id: 'captura', label: 'Adjuntar una captura o copia de la respuesta recibida' },
    { id: 'cambio', label: 'Explicar qué cambió o corrigió él o ella' },
    { id: 'verif', label: 'Contar cómo verificó la información' }
  ];

  // Nombre de cada carril tal como sale en el borrador y lo lee el lector de pantalla.
  const LANE_NAMES = { g: 'La IA puede ayudar (verde)', y: 'Con declaración y límites (amarillo)', r: 'Sin IA: lo hace el estudiante (rojo)' };

  // Texto de los tres botones de color de cada tarea.
  const LANE_SHORT = { g: 'Verde', y: 'Amarillo', r: 'Rojo' };

  // Texto de ayuda del campo «por qué», según el carril.
  const WHY_HINT = { g: '¿Por qué puede ayudar?', y: '¿Qué límite ponés?', r: '¿Qué practica solo?' };

  // Mensaje del panel de sellos al clasificar una tarea.
  const RADIO = {
    g: 'Anotado en verde. Ahora explicá por qué la IA puede ayudar sin quitarle aprendizaje.',
    y: 'Anotado en amarillo. Definí el límite: ¿qué tiene que hacer o declarar el estudiante?',
    r: 'Anotado en rojo. Acá se juega el aprendizaje: ¿qué habilidad practica sin ayuda?',
    pool: 'La tarea volvió a sin clasificar.'
  };

  // Largo máximo de cada campo (en caracteres) y cantidad máxima de tareas.
  const MAX = { materia: 80, actividad: 100, objetivo: 400, task: 120, why: 160, otra: 160, evaluacion: 400, tasks: 80 };

  return { EXAMPLE, DECL, LANE_NAMES, LANE_SHORT, WHY_HINT, RADIO, MAX };
})();
