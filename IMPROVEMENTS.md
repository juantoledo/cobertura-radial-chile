# Radiomap — Mejoras y estado actual

## Lo que está bien hecho

### Arquitectura y estructura
- **Stack simple y mantenible**: HTML/CSS/JS vanilla, sin frameworks pesados. Fácil de entender y modificar.
- **Separación de responsabilidades**: `location-filter.js` (geolocalización + sync filtros), `export-csv.js` (exportación), `theme.js` (tema), `help.js` (modal). Código modular.
- **Fuente de datos única**: CSV como fuente de verdad → `csv-to-datajs.py` genera `data.js`. Flujo claro.
- **CI/CD automatizado**: GitHub Actions con bump semántico (feat→minor, fix→patch), deploy a Pages, cache busting en HTML.

### UX/UI
- **Tema claro/oscuro**: Respeta `prefers-color-scheme`, override guardado en cookie, tiles del mapa adaptados.
- **Ayuda contextual**: Modal de ayuda en primera visita, cierre con Escape, overlay clicable.
- **Vista móvil**: Header sticky, menú hamburguesa, controles compactos, tipografía escalable (elderly-friendly en móvil).
- **Barra de metodología**: Explicación visible de EIRP y cobertura teórica. Transparencia en el cálculo.
- **Filtros sincronizados**: Estado de filtros compartido entre mapa y lista (sessionStorage + URL params).
- **Compartir vista**: Botón ↗ Compartir genera enlace con filtros, 📍 si aplica, centro/zoom/modo del mapa y repetidora seleccionada (`share-view.js` + query en `location-filter.js`).
- **Cerca de mí**: Geolocalización con feedback visual (marcador, botón activo), radio 100 km.

### Accesibilidad
- **ARIA**: `aria-label`, `aria-expanded`, `aria-haspopup`, `aria-hidden`, `role="dialog"`, `aria-labelledby` en modales y controles.
- **Focus visible**: Estilos `:focus` en inputs y selects.
- **Navegación semántica**: `<nav aria-label="Navegación principal">`.

### Datos y funcionalidad
- **Cobertura teórica**: Círculos por EIRP, base VHF/UHF, límite ×2.5. Cálculo documentado.
- **Nodos cercanos**: Pre-cálculo de vecinos por distancia, sidebar con lista ordenada.
- **Export CSV**: Nombres de archivo descriptivos según filtros aplicados.
- **Compartir**: Web Share API con fallback a clipboard.
- **Datos curados**: Inclusión de Echolink (Red Chile, RCDR, Conferencia Sur) con coordenadas.

### DevOps
- **Versionado automático**: Conventional Commits → bump semántico.
- **Cache busting**: Query string `?v=VERSION` en assets para evitar caché obsoleto.
- **Tags de release**: `v1.12.1` etc. en cada deploy.

---

## Mejoras propuestas (priorizadas)

### Prioridad 1 — Rápido y alto impacto

| # | Categoría | Idea | Esfuerzo |
|---|-----------|------|----------|
| 1 | Optimización | **Debounce en búsqueda** — Evitar `applyFilters()` en cada tecla; 200–300 ms. | Bajo |
| 2 | UX | ~~**Compartir vista actual**~~ — Hecho: URL con filtros, near, mapa (mlat/mlon/zoom/mode) y `signal`. | — |
| 3 | UX | **Empty state mejorado** — Mensaje claro cuando no hay resultados ("Prueba con otros filtros"). | Bajo |
| 4 | Código | **Unificar lógica de filtros** — Extraer `getFiltered()` a `location-filter.js` para evitar duplicación map/list. | Medio |
| 5 | SEO/Share | **Meta Open Graph / Twitter Cards** — Para preview al compartir en redes. | Bajo |

### Prioridad 2 — Impacto medio

| # | Categoría | Idea | Esfuerzo |
|---|-----------|------|----------|
| 6 | Nueva feature | **Favoritos** — Guardar repetidoras en localStorage, filtrar por favoritos. | Medio |
| 7 | Nueva feature | **Filtro por distancia** — Slider "mostrar solo dentro de X km" además del radio fijo. | Medio |
| 8 | Nueva feature | **Alertas de vencimiento** — Indicador de cuántas vencen en 30/90 días. | Medio |
| 9 | Optimización | **Virtualización en lista** — Si crece el dataset, virtual scroll para rendimiento. | Medio |
| 10 | UX | **Atajos de teclado** — Esc para cerrar sidebar, ? para ayuda. | Bajo |
| 11 | UX | **Orden de lista** — Ordenar por señal, distancia, vencimiento. | Bajo |

### Prioridad 3 — Largo plazo

| # | Categoría | Idea | Esfuerzo |
|---|-----------|------|----------|
| 12 | Nueva feature | **PWA / offline** — Service Worker para uso sin conexión. | Alto |
| 13 | Nueva feature | **Ruta entre puntos** — Integrar OSRM u otro para routing. | Alto |
| 14 | Nueva feature | **Comparación de cobertura** — Mostrar dos repetidoras en el mapa a la vez. | Medio |
| 15 | Datos | **Sincronización SUBTEL** — Pipeline para actualizar desde fuente oficial. | Alto |
| 16 | Código | **Tests unitarios** — Filtros, export CSV, cálculo de vecinos. | Medio |
| 17 | Código | **Linting** — ESLint + Prettier. | Bajo |

### Prioridad 4 — Nice to have

| # | Categoría | Idea | Esfuerzo |
|---|-----------|------|----------|
| 18 | Nueva feature | **Filtro por tono** — Buscar por CTCSS/DCS específico. | Bajo |
| 19 | Nueva feature | **Modo simplex** — Filtrar solo nodos simplex (RX = TX). | Bajo |
| 20 | UX | **Tooltips en filtros** — Explicar qué hace cada filtro. | Bajo |
| 21 | Accesibilidad | **Skip link** — "Saltar al contenido" para teclado. | Bajo |
| 22 | Accesibilidad | **prefers-reduced-motion** — Reducir animaciones. | Bajo |
| 23 | DevOps | **Pre-commit hooks** — Ejecutar csv-to-datajs.py antes de commit. | Bajo |
| 24 | DevOps | **Sitemap** — Para indexación. | Bajo |

---

## Categorías detalladas

### Nuevas funcionalidades
- PWA / offline
- Compartir vista actual (filtros + mapa)
- Favoritos / marcadores
- Ruta entre puntos
- Alertas de vencimiento
- Filtro por distancia (slider)
- Comparación de cobertura
- Modo simplex
- Filtro por tono CTCSS/DCS
- Importar/exportar conjuntos de filtros

### Optimización
- Debounce en búsqueda
- Virtualización en lista
- Cálculo de vecinos (index espacial si crece)
- Minificar/compress data.js
- Preload de fuentes críticas

### Mejoras UX/UI
- Empty states
- Tooltips en filtros
- Atajos de teclado
- Orden de lista (señal, distancia, vencimiento)
- Colapsar controles en móvil
- Animaciones de transición

### Accesibilidad
- Skip link
- Focus visible más visible
- ARIA en mapa
- prefers-reduced-motion

### Datos
- Validación de CSV antes de build
- Normalización de fechas
- Sincronización SUBTEL

### Código
- Unificar lógica de filtros
- Tests
- ESLint/Prettier
- JSDoc

### DevOps
- Pre-commit hooks
- CI de validación de datos
- Sitemap
- Meta OG/Twitter
