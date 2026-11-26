import { useEffect, useState } from 'react';
import { mesasService } from '../services/mesasService';

const ESTADOS_ESTILO = {
  libre: 'bg-emerald-50 border-emerald-500 text-emerald-900',
  ocupada: 'bg-rose-50 border-rose-500 text-rose-900',
  cobrando: 'bg-amber-50 border-amber-500 text-amber-900',
};

export default function MesasPage({ onSeleccionarMesa }) {
  const [mesas, setMesas] = useState([]);
  const [zonaActiva, setZonaActiva] = useState('todas');
  const [nuevaMesa, setNuevaMesa] = useState({ numero: '', zona: 'salon', capacidad: 4 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarMesas() {
      try {
        const data = await mesasService.obtenerMesas();
        setMesas(data);
      } catch (err) {
        setError('Error al cargar mesas: ' + err.message);
      } finally {
        setCargando(false);
      }
    }

    cargarMesas();
    const desuscribir = mesasService.suscribirCambiosMesas(() => {
      cargarMesas();
    });
    return desuscribir;
  }, []);

  async function handleCrearMesa(e) {
    e.preventDefault();
    try {
      setError('');
      const creada = await mesasService.crearMesa(nuevaMesa);
      setMesas((prev) => [...prev, creada]);
      setNuevaMesa({ numero: '', zona: 'salon', capacidad: 4 });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCambioEstado(e, mesa, nuevoEstado) {
    e.stopPropagation();
    try {
      setError('');
      const actualizada = await mesasService.cambiarEstadoMesa(mesa.id, nuevoEstado);
      setMesas((prev) => prev.map((m) => (m.id === mesa.id ? actualizada : m)));
    } catch (err) {
      setError(err.message);
    }
  }

  const mesasFiltradas =
    zonaActiva === 'todas' ? mesas : mesas.filter((m) => m.zona === zonaActiva);

  if (cargando) return <div className="p-6 text-stone-600">Cargando mapa de mesas...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Gestión de Mesas</h2>
          <p className="text-sm text-stone-500">Control operativo por sector y estado</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
            Libres: {mesas.filter((m) => m.estado === 'libre').length}
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800">
            Ocupadas: {mesas.filter((m) => m.estado === 'ocupada').length}
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800">
            Cobrando: {mesas.filter((m) => m.estado === 'cobrando').length}
          </span>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Alta rápida de mesa */}
      <form
        onSubmit={handleCrearMesa}
        className="bg-white p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
            Identificador
          </label>
          <input
            type="text"
            placeholder="Ej. Mesa 5"
            value={nuevaMesa.numero}
            onChange={(e) => setNuevaMesa({ ...nuevaMesa, numero: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
            Sector
          </label>
          <select
            value={nuevaMesa.zona}
            onChange={(e) => setNuevaMesa({ ...nuevaMesa, zona: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="salon">Salón</option>
            <option value="deck">Deck</option>
            <option value="mostrador">Mostrador</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
            Capacidad
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={nuevaMesa.capacidad}
            onChange={(e) => setNuevaMesa({ ...nuevaMesa, capacidad: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-amber-900 hover:bg-amber-800 text-white font-medium py-2 px-4 rounded-lg text-sm cursor-pointer"
        >
          Agregar Mesa
        </button>
      </form>

      {/* Filtro por zonas */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'todas', label: 'Todas las zonas' },
          { id: 'salon', label: 'Salón' },
          { id: 'deck', label: 'Deck' },
          { id: 'mostrador', label: 'Mostrador' },
        ].map((z) => (
          <button
            key={z.id}
            onClick={() => setZonaActiva(z.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              zonaActiva === z.id
                ? 'bg-stone-800 text-white'
                : 'bg-white border border-stone-300 text-stone-700'
            }`}
          >
            {z.label}
          </button>
        ))}
      </div>

      {/* Grilla lógica de mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mesasFiltradas.map((mesa) => (
          <div
            key={mesa.id}
            onClick={() => onSeleccionarMesa && onSeleccionarMesa(mesa)}
            className={`border-2 rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition ${
              ESTADOS_ESTILO[mesa.estado] || 'bg-white border-stone-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{mesa.numero}</h3>
                <span className="text-xs uppercase opacity-75">{mesa.zona}</span>
              </div>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-white/70">
                {mesa.estado}
              </span>
            </div>

            <div className="flex gap-1 pt-2 border-t border-black/10">
              {['libre', 'ocupada', 'cobrando'].map((est) => (
                <button
                  key={est}
                  type="button"
                  disabled={mesa.estado === est}
                  onClick={(e) => handleCambioEstado(e, mesa, est)}
                  className="flex-1 text-[11px] py-1 rounded bg-white/80 hover:bg-white disabled:opacity-40 font-medium capitalize cursor-pointer"
                >
                  {est}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}