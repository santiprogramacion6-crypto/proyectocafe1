import { useEffect, useState } from 'react';
import { productosService } from '../services/productosService';

const FORM_INICIAL = {
  nombre: '',
  precio: '',
  categoria_id: '',
  disponible: true,
};

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true);
        setError('');
        const [catsData, prodsData] = await Promise.all([
          productosService.obtenerCategorias(),
          productosService.obtenerProductos(),
        ]);
        setCategorias(catsData);
        setProductos(prodsData);
        if (catsData.length > 0) {
          setForm((prev) => ({
            ...prev,
            categoria_id: prev.categoria_id || catsData[0].id,
          }));
        }
      } catch (err) {
        setError('Error al cargar el catálogo: ' + err.message);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio || !form.categoria_id) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    try {
      setGuardando(true);
      setError('');

      if (editandoId) {
        const actualizado = await productosService.actualizarProducto(editandoId, form);
        setProductos((prev) =>
          prev.map((p) => (p.id === editandoId ? actualizado : p))
        );
        setEditandoId(null);
      } else {
        const nuevo = await productosService.crearProducto(form);
        setProductos((prev) => [...prev, nuevo]);
      }

      setForm({
        ...FORM_INICIAL,
        categoria_id: categorias[0]?.id || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function iniciarEdicion(producto) {
    setEditandoId(producto.id);
    setForm({
      nombre: producto.nombre,
      precio: producto.precio,
      categoria_id: producto.categoria_id,
      disponible: producto.disponible,
    });
    setError('');
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm({
      ...FORM_INICIAL,
      categoria_id: categorias[0]?.id || '',
    });
    setError('');
  }

  async function toggleDisponibilidad(producto) {
    try {
      const actualizado = await productosService.actualizarProducto(producto.id, {
        disponible: !producto.disponible,
      });
      setProductos((prev) =>
        prev.map((p) => (p.id === producto.id ? actualizado : p))
      );
    } catch (err) {
      setError('No se pudo cambiar el estado: ' + err.message);
    }
  }

  async function handleEliminar(id, nombre) {
    if (!window.confirm(`¿Eliminar "${nombre}" del catálogo?`)) return;
    try {
      await productosService.eliminarProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError('No se pudo eliminar (puede estar asociado a una comanda): ' + err.message);
    }
  }

  const productosFiltrados =
    filtroCategoria === 'todas'
      ? productos
      : productos.filter((p) => String(p.categoria_id) === String(filtroCategoria));

  if (cargando) {
    return <div className="p-6 text-stone-600">Cargando catálogo de Laurentino...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Gestión de Productos</h2>
          <p className="text-sm text-stone-500">Catálogo operativo de cafetería y cocina</p>
        </div>
        <span className="text-sm font-medium bg-amber-100 text-amber-900 px-3 py-1 rounded-full self-start">
          {productos.length} productos registrados
        </span>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Formulario de Alta / Edición */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
      >
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
            Nombre del producto
          </label>
          <input
            type="text"
            placeholder="Ej. Flat White"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            required
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
            Categoría
          </label>
          <select
            value={form.categoria_id}
            onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
            Precio ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="4400"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            required
          />
        </div>

        <div className="sm:col-span-3 flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm transition cursor-pointer"
          >
            {guardando ? 'Guardando...' : editandoId ? 'Actualizar' : 'Agregar'}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium py-2 px-3 rounded-lg text-sm transition cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Filtros visuales por categoría */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroCategoria('todas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            filtroCategoria === 'todas'
              ? 'bg-stone-800 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }`}
        >
          Todas
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFiltroCategoria(cat.id)}
            style={{
              backgroundColor:
                String(filtroCategoria) === String(cat.id) ? cat.color_hex : undefined,
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              String(filtroCategoria) === String(cat.id)
                ? 'text-white shadow-sm'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Listado de Productos */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-600 text-xs uppercase border-b border-stone-200">
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-stone-400">
                    No hay productos en esta categoría.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-medium text-stone-800">{prod.nombre}</td>
                    <td className="py-3 px-4">
                      <span
                        style={{ backgroundColor: prod.categorias?.color_hex || '#5D4037' }}
                        className="text-white text-xs font-medium px-2.5 py-1 rounded-md"
                      >
                        {prod.categorias?.nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-700">
                      ${Number(prod.precio).toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleDisponibilidad(prod)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer ${
                          prod.disponible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prod.disponible ? 'Disponible' : 'Sin stock'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => iniciarEdicion(prod)}
                        className="text-amber-800 hover:underline font-medium text-xs cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(prod.id, prod.nombre)}
                        className="text-red-600 hover:underline font-medium text-xs cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}