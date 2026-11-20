import { supabase } from '../supabaseClient';

export const productosService = {
    async obtenerCategorias() {
        const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true });

        if (error) throw error;
        return data;
    },
    async obtenerCategoriaPorId(id) {
        const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', id)
        .single();

        if (error) throw error;
        return data;
    },
    async obtenerProductos() {
        const { data, error } = await supabase
        .from('productos')
        .select(`
            id,
            nombre,
            precio,
            disponible,
            categoria_id,
            categorias (id, nombre, color_hex)
        `)
        .order('nombre', { ascending: true });
        if (error) throw error;
        return data;
    },
    async crearProducto({ nombre, precio, categoria_id, disponible = true }) {
        const nombreLimpio = nombre.trim();
        const precioNumerico = parseFloat(precio);

        if (!nombreLimpio || isNaN(precioNumerico) || precioNumerico < 0 ) {
            throw new Error('Datos del producto inválidos');
        }   
        const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: nombreLimpio,
        precio: precioNumerico,
        categoria_id: Number(categoria_id),
        disponible: Boolean(disponible),
      }])
      .select(`
        id, nombre, precio, disponible, categoria_id,
        categorias ( id, nombre, color_hex )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async actualizarProducto(id, campos) {
    const payload = { ...campos, updated_at: new Date().toISOString() };
    if (payload.nombre) payload.nombre = payload.nombre.trim();
    if (payload.precio !== undefined) payload.precio = parseFloat(payload.precio);

    const { data, error } = await supabase
      .from('productos')
      .update(payload)
      .eq('id', id)
      .select(`
        id, nombre, precio, disponible, categoria_id,
        categorias ( id, nombre, color_hex )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async eliminarProducto(id) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};