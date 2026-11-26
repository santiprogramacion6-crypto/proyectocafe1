import { supabase } from '../supabaseClient';

const COMANDA_ABIERTA_SELECT = `
  id, mesa_id, estado_comanda, total,
  detalle_comanda (
    id, producto_id, cantidad, precio_unitario, nota
  )
`;

async function buscarComandaAbierta(mesaId) {
  const { data, error } = await supabase
    .from('comandas')
    .select(COMANDA_ABIERTA_SELECT)
    .eq('mesa_id', mesaId)
    .eq('estado_comanda', 'abierta')
    .order('id', { ascending: true })
    .limit(2);

  if (error) throw error;

  if (data.length > 1) {
    throw new Error(
      `La mesa ${mesaId} tiene más de una comanda abierta. Revisá y resolvé los duplicados en Supabase.`,
    );
  }

  return data[0] ?? null;
}

export const comandasService = {
  // Busca la comanda abierta; la unicidad también debe estar garantizada en la base.
  async obtenerOCrearComandaAbierta(mesaId) {
    const existente = await buscarComandaAbierta(mesaId);
    if (existente) return existente;

    // Si no existe, creamos la comanda y marcamos la mesa como 'ocupada'
    const { data: nueva, error: errorCreacion } = await supabase
      .from('comandas')
      .insert([{ mesa_id: mesaId, estado_comanda: 'abierta', total: 0 }])
      .select('id, mesa_id, estado_comanda, total')
      .single();

    if (errorCreacion) {
      if (errorCreacion.code === '23505') {
        const creadaEnParalelo = await buscarComandaAbierta(mesaId);
        if (creadaEnParalelo) return creadaEnParalelo;
      }

      throw errorCreacion;
    }

    await supabase
      .from('mesas')
      .update({ estado: 'ocupada', updated_at: new Date().toISOString() })
      .eq('id', mesaId);

    return { ...nueva, detalle_comanda: [] };
  },

  // Agrega un producto a la comanda y recalcula el total
  async agregarItem(comandaId, producto, cantidad = 1, nota = '') {
    const { error } = await supabase
      .from('detalle_comanda')
      .insert([{
        comanda_id: comandaId,
        producto_id: producto.id,
        cantidad: Number(cantidad),
        precio_unitario: Number(producto.precio),
        nota: nota.trim(),
      }]);

    if (error) throw error;
    return await this.recalcularTotal(comandaId);
  },

  // Elimina un ítem y recalcula el total
  async eliminarItem(detalleId, comandaId) {
    const { error } = await supabase
      .from('detalle_comanda')
      .delete()
      .eq('id', detalleId);

    if (error) throw error;
    return await this.recalcularTotal(comandaId);
  },

  // Suma todos los ítems desde la BD para evitar desincronización de precios
  async recalcularTotal(comandaId) {
    const { data: items, error: errorItems } = await supabase
      .from('detalle_comanda')
      .select('cantidad, precio_unitario')
      .eq('comanda_id', comandaId);

    if (errorItems) throw errorItems;

    const nuevoTotal = items.reduce(
      (acc, item) => acc + Number(item.cantidad) * Number(item.precio_unitario),
      0
    );

    const { error: errorUpdate } = await supabase
      .from('comandas')
      .update({ total: nuevoTotal })
      .eq('id', comandaId);

    if (errorUpdate) throw errorUpdate;
    return nuevoTotal;
  },

  // Cierra la comanda y vuelve a dejar la mesa 'libre'
  async cerrarComanda(comandaId, mesaId) {
    const { error: errorComanda } = await supabase
      .from('comandas')
      .update({ estado_comanda: 'cerrada', closed_at: new Date().toISOString() })
      .eq('id', comandaId);

    if (errorComanda) throw errorComanda;

    const { error: errorMesa } = await supabase
      .from('mesas')
      .update({ estado: 'libre', updated_at: new Date().toISOString() })
      .eq('id', mesaId);

    if (errorMesa) throw errorMesa;
  }
};