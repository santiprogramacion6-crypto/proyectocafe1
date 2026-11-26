import { useEffect, useState } from 'react';
import { comandasService } from '../services/comandasService';
import { productosService } from '../services/productosService';

function incluirProductosEnComanda(comanda, productos) {
  const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));

  return {
    ...comanda,
    detalle_comanda: (comanda.detalle_comanda || []).map((item) => ({
      ...item,
      productos: productosPorId.get(item.producto_id),
    })),
  };
}

export default function ComandasPage({ mesa, onVolver }) {
  const [comanda, setComanda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [nota, setNota] = useState('');
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarTodo() {
      try {
        setCargando(true);
        setError('');
        const [comandaData, productosData] = await Promise.all([
          comandasService.obtenerOCrearComandaAbierta(mesa.id),
          productosService.obtenerProductos(),
        ]);
        setComanda(incluirProductosEnComanda(comandaData, productosData));
        setProductos(productosData);
      } catch (err) {
        setError('Error al cargar la comanda: ' + err.message);
      } finally {
        setCargando(false);
      }
    }

    if (mesa?.id) cargarTodo();
  }, [mesa?.id]);

  async function handleAgregarProducto(producto) {
    try {
      setProcesando(true);
      setError('');
      await comandasService.agregarItem(comanda.id, producto, 1, nota);
      setNota('');
      const actualizada = await comandasService.obtenerOCrearComandaAbierta(mesa.id);
      setComanda(incluirProductosEnComanda(actualizada, productos));
    } catch (err) {
      setError('No se pudo agregar el producto: ' + err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function handleEliminarItem(detalleId) {
    try {
      setProcesando(true);
      await comandasService.eliminarItem(detalleId, comanda.id);
      const actualizada = await comandasService.obtenerOCrearComandaAbierta(mesa.id);
      setComanda(incluirProductosEnComanda(actualizada, productos));
    } catch (err) {
      setError('No se pudo quitar el ítem: ' + err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function handleCerrarMesa() {
    if (!window.confirm(`¿Cerrar cuenta de ${mesa.numero} por $${comanda.total}?`)) return;
    try {
      setProcesando(true);
      await comandasService.cerrarComanda(comanda.id, mesa.id);
      onVolver();
    } catch (err) {
      setError('Error al cerrar cuenta: ' + err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (!mesa) return null;
  if (cargando) return <div className="p-6 text-stone-600">Abriendo comanda de {mesa.numero}...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Comanda — {mesa.numero}</h2>
          <p className="text-xs uppercase text-stone-500">Sector: {mesa.zona}</p>
        </div>
        <button
          onClick={onVolver}
          className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
        >
          ← Volver a Mesas
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Catálogo rápido */}
        <div className="lg:col-span-7 space-y-3">
          <input
            type="text"
            placeholder="Nota opcional antes de tocar producto (ej. Leche almendras, tibio)..."
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {productos.filter((prod) => prod.disponible).map((prod) => (
              <button
                key={prod.id}
                disabled={procesando}
                onClick={() => handleAgregarProducto(prod)}
                style={{ borderLeftColor: prod.categorias?.color_hex || '#5D4037' }}
                className="bg-white border border-stone-200 border-l-4 rounded-lg p-3 text-left hover:shadow transition disabled:opacity-50 cursor-pointer"
              >
                <div className="font-semibold text-sm text-stone-800">{prod.nombre}</div>
                <div className="text-xs text-stone-500 mt-1">
                  ${Number(prod.precio).toLocaleString('es-AR')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Detalle de cuenta */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-stone-700 border-b pb-2">Detalle del Pedido</h3>
            {comanda?.detalle_comanda?.length === 0 ? (
              <p className="text-sm text-stone-400 py-4">Aún no hay productos cargados.</p>
            ) : (
              <ul className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                {comanda?.detalle_comanda?.map((item) => (
                  <li key={item.id} className="py-2 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium text-stone-800">
                        {item.cantidad}x {item.productos?.nombre}
                      </span>
                      {item.nota && (
                        <p className="text-xs text-amber-800 italic">Nota: {item.nota}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        ${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}
                      </span>
                      <button
                        onClick={() => handleEliminarItem(item.id)}
                        disabled={procesando}
                        className="text-red-600 hover:underline text-xs cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-stone-200 pt-3 space-y-3">
            <div className="flex justify-between text-lg font-bold text-stone-900">
              <span>Total:</span>
              <span>${Number(comanda?.total || 0).toLocaleString('es-AR')}</span>
            </div>
            <button
              onClick={handleCerrarMesa}
              disabled={procesando || comanda?.detalle_comanda?.length === 0}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer"
            >
              Cobrar y Liberar Mesa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}