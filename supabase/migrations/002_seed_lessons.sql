-- Seed: unidad Sistemas Operativos (8 lecciones)

insert into public.lessons (
  id, title, objective, competency, difficulty, sort_order,
  pre_test_question, pre_test_answer, post_test_question, post_test_answer
) values
(
  'so-01',
  '¿Qué es un sistema operativo?',
  'Construir una definición técnica de sistema operativo partiendo de experiencias cotidianas.',
  'Reconozco principios y conceptos propios de la tecnología y la informática.',
  1, 1,
  'En tus palabras, ¿qué crees que es un sistema operativo?',
  'programa',
  '¿Cómo le explicarías a un amigo qué es un sistema operativo y por qué el dispositivo lo necesita?',
  'coordina'
),
(
  'so-02',
  '¿Para qué sirve un sistema operativo?',
  'Identificar las funciones que cumple el sistema operativo para que las aplicaciones funcionen.',
  'Analizo el funcionamiento de artefactos y sistemas tecnológicos.',
  1, 2,
  '¿Qué crees que pasaría si un computador no tuviera sistema operativo?',
  'programas',
  'Menciona dos funciones del sistema operativo y explica por qué son necesarias.',
  'gestiona'
),
(
  'so-03',
  'Partes de un sistema operativo',
  'Reconocer los componentes del sistema operativo y la relación entre ellos.',
  'Identifico componentes y relaciones dentro de un sistema tecnológico.',
  2, 3,
  '¿Qué partes o componentes crees que tiene un sistema operativo por dentro?',
  'interfaz',
  '¿Qué diferencia hay entre la interfaz que ves y lo que el sistema hace por dentro?',
  'kernel'
),
(
  'so-04',
  'Windows',
  'Comprender qué es Windows, sus características y su relación con el sistema operativo.',
  'Comparo características de artefactos y sistemas tecnológicos.',
  2, 4,
  '¿Qué es Windows y en qué dispositivos lo has visto?',
  'sistema',
  'Nombra dos características de Windows y explica para qué sirven.',
  'microsoft'
),
(
  'so-05',
  'Historia de Windows',
  'Analizar la evolución de Windows como respuesta a necesidades tecnológicas.',
  'Relaciono la evolución de la tecnología con el contexto y las necesidades.',
  2, 5,
  '¿Por qué crees que las versiones de Windows han ido cambiando con el tiempo?',
  'cambios',
  '¿Qué cambio importante en la historia de Windows te parece más útil y por qué?',
  'interfaz'
),
(
  'so-06',
  'macOS y Apple',
  'Diferenciar empresa (Apple), ecosistema y sistema operativo (macOS).',
  'Distingo conceptos tecnológicos relacionados pero diferentes.',
  2, 6,
  '¿Qué diferencia hay entre Apple y macOS?',
  'empresa',
  'Explica la relación entre Apple, su ecosistema y macOS.',
  'sistema'
),
(
  'so-07',
  'Historia de macOS/Apple',
  'Analizar la evolución de macOS y Apple relacionándola con el contexto tecnológico.',
  'Relaciono la evolución de la tecnología con el contexto y las necesidades.',
  2, 7,
  '¿Qué sabes sobre cómo empezó Apple o macOS?',
  'apple',
  '¿Qué transformación en la historia de macOS/Apple consideras significativa y por qué?',
  'evolucion'
),
(
  'so-08',
  'Comparación entre Windows y macOS',
  'Comparar Windows y macOS con criterios y evidencias, distinguiendo preferencia de argumento.',
  'Tomo decisiones tecnológicas fundamentadas en criterios y evidencias.',
  3, 8,
  'Si tuvieras que elegir entre Windows y macOS, ¿qué compararías antes de decidir?',
  'caracteristicas',
  'Elige un caso de uso y justifica con criterios qué sistema operativo sería más adecuado.',
  'porque'
)
on conflict (id) do update set
  title = excluded.title,
  objective = excluded.objective,
  competency = excluded.competency,
  difficulty = excluded.difficulty,
  sort_order = excluded.sort_order,
  pre_test_question = excluded.pre_test_question,
  pre_test_answer = excluded.pre_test_answer,
  post_test_question = excluded.post_test_question,
  post_test_answer = excluded.post_test_answer;
