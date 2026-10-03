// Calcula, para una mesa, dónde dibujar el ícono de CADA persona (no de cada invitación)
// alrededor de su forma (spec 17: arrastrar invitados al Plano). Función pura, sin React
// ni reactflow.
//
// Segunda corrección: la primera versión anclaba un punto por INVITACIÓN y apilaba ahí
// (pegados entre sí) los íconos de toda la gente de esa invitación. Con invitaciones de
// varias personas eso se veía como un bloque amontonado en un solo punto del borde, en
// vez de gente sentada alrededor de la mesa. Ahora cada persona tiene su propio punto en
// el perímetro — las de una misma invitación quedan en puntos consecutivos (arco
// contiguo), pero ya no superpuestas.
//
// Tercera corrección: los puntos ya no se repartían según cuánta gente hay OCUPADA sino
// según la CAPACIDAD de la mesa. Con 2 personas en una mesa de 8, el punto 2 caía al 100%
// del círculo repartido entre 2 → quedaba diametralmente opuesto al primero (como si
// fueran los asientos 1 y 5), en vez de sentarse una junto a la otra (asientos 1 y 2). Los
// "asientos" (slots) ahora son fijos según `capacity` y se llenan en orden desde el
// primero; el tamaño del ícono también depende de la capacidad, no de la ocupación, para
// que no cambie de tamaño cada vez que se asigna o quita gente de la misma mesa.

export type TableShape = 'round' | 'square' | 'rectangular' | 'imperial';

export interface SeatPosition {
  x: number; // offset en px respecto al centro de la mesa
  y: number;
}

// Spec 23 — un elemento por SUB-ASIENTO individual ya asignado a esta mesa (antes era
// uno por invitación completa). Los de una misma invitación quedan en puntos
// consecutivos del perímetro siempre que el llamador los pase agrupados (ver
// PlanoCanvas), pero cada uno se arrastra/reasigna por separado.
export interface PartyInput {
  seatId: string; // id del FirebaseTableSeat — identidad para arrastrar/reasignar
  guestId: string; // invitación dueña de este sub-asiento
  name: string; // nombre a mostrar de ESTA persona (getSeatDisplayName)
}

export interface SeatIcon {
  seatId: string;
  guestId: string;
  guestName: string;
  x: number; // offset respecto al centro de la mesa
  y: number;
}

export interface PartyLayoutInput {
  shape: TableShape;
  width: number;
  height: number;
  parties: PartyInput[];
  capacity: number; // asientos totales de la mesa: define los slots fijos del perímetro
  maxSeats?: number; // tope de slots a dibujar; el resto (ocupado) se resume en "+N"
}

export interface PartyLayoutResult {
  seats: SeatIcon[];
  iconSize: number; // px de cada ícono
  ringMargin: number; // distancia fija del borde de la mesa a cada punto
  // Cuánto puede sobresalir un ícono por DEBAJO del borde de la mesa en el peor caso (un
  // asiento anclado justo abajo-centro): TableNode usa esto para separar la etiqueta del
  // nombre lo suficiente como para que nunca choquen, sin importar cuánta gente haya.
  labelClearance: number;
  overflowSeats: number; // personas que no alcanzaron punto (degradación)
}

const DEFAULT_MAX_SEATS = 16;
// Desfase angular/de perímetro para que, con poca gente, ningún asiento caiga
// exactamente abajo-centro (justo donde vive la etiqueta con el nombre de la mesa) —
// puramente estético; la separación real la garantiza `labelClearance`, no este desfase.
const START_OFFSET_RAD = 0.35;

// Reparte `d` (distancia recorrida sobre el perímetro, empezando arriba-izquierda y en
// sentido horario) en un punto {x,y} relativo al centro de un rectángulo w×h, a `margin`
// px por fuera del borde. Sirve tanto para 'square' como 'rectangular'/'imperial'.
function pointOnRectPerimeter(d: number, w: number, h: number, margin: number): SeatPosition {
  const halfW = w / 2;
  const halfH = h / 2;
  if (d < w) return { x: -halfW + d, y: -halfH - margin };
  d -= w;
  if (d < h) return { x: halfW + margin, y: -halfH + d };
  d -= h;
  if (d < w) return { x: halfW - d, y: halfH + margin };
  d -= w;
  return { x: -halfW - margin, y: halfH - d };
}

export function computePartyLayout({
  shape,
  width,
  height,
  parties,
  capacity,
  maxSeats = DEFAULT_MAX_SEATS,
}: PartyLayoutInput): PartyLayoutResult {
  const totalRequested = parties.length;
  // Slots fijos del perímetro: uno por asiento de la mesa (no por persona ocupada), para
  // que la gente se acomode en asientos consecutivos en vez de repartirse por todo el
  // círculo cuando la mesa está poco ocupada.
  const slotCount = Math.max(1, Math.min(capacity || totalRequested, maxSeats));
  const occupiedSlots = Math.min(totalRequested, slotCount);
  const overflowSeats = totalRequested - occupiedSlots;

  // El tamaño del ícono depende de cuántos asientos tiene la mesa, no de cuántos están
  // ocupados: así no cambia de tamaño cada vez que se asigna o quita gente de la mesa.
  const iconSize = Math.max(11, Math.min(22, 24 - slotCount));
  const ringMargin = 14 + iconSize / 2;

  const anchors: SeatPosition[] = [];
  if (slotCount > 0) {
    if (shape === 'round') {
      const r = width / 2 + ringMargin;
      for (let i = 0; i < slotCount; i++) {
        const angle = (i / slotCount) * Math.PI * 2 - Math.PI / 2 - START_OFFSET_RAD;
        anchors.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
    } else {
      const perimeter = 2 * (width + height);
      const startOffset = (perimeter * START_OFFSET_RAD) / (Math.PI * 2);
      for (let i = 0; i < slotCount; i++) {
        const d = ((i / slotCount) * perimeter + startOffset) % perimeter;
        anchors.push(pointOnRectPerimeter(d, width, height, ringMargin));
      }
    }
  }

  const seats: SeatIcon[] = [];
  for (const party of parties) {
    if (seats.length >= occupiedSlots) break;
    const anchor = anchors[seats.length];
    seats.push({
      seatId: party.seatId,
      guestId: party.guestId,
      guestName: party.name,
      x: anchor.x,
      y: anchor.y,
    });
  }

  return {
    seats,
    iconSize,
    ringMargin,
    // +6px de aire extra sobre el peor caso, para que nunca queden pegados sin margen.
    labelClearance: ringMargin + iconSize / 2 + 6,
    overflowSeats,
  };
}
