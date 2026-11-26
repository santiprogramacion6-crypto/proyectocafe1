import { supabase } from '../supabaseClient';

const ESTADOS_VALIDOS = ['libre', 'ocupada', 'cobrando'];
const ZONAS_VALIDAS = ['salon', 'deck', 'mostrador'];

export const mesasService = {
  async obtenerMesas() {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data;
  },

  async crearMesa({ numero, zona, capacidad = 4 }) {
    const numeroLimpio = numero.trim();
    if (!numeroLimpio) throw new Error('El nombre o número de mesa es obligatorio.');
    if (!ZONAS_VALIDAS.includes(zona)) throw new Error('Zona inválida.');

    const { data, error } = await supabase
      .from('mesas')
      .insert([{
        numero: numeroLimpio,
        zona,
        estado: 'libre',
        capacidad: Number(capacidad) || 4,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cambiarEstadoMesa(id, nuevoEstado) {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
      throw new Error(`Estado no permitido: ${nuevoEstado}`);
    }

    const { data, error } = await supabase
      .from('mesas')
      .update({
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async eliminarMesa(id) {
    const { error } = await supabase
      .from('mesas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  suscribirCambiosMesas(callback) {
    const canal = supabase
      .channel('cambios-mesas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mesas' },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }
};