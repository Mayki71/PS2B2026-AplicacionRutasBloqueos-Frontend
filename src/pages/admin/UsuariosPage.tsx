import { useEffect, useState } from 'react';
import { getUsuarios } from '../../modules/admin/services/adminService';

export default function UsuariosPage() {

  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    getUsuarios().then(setUsuarios);
  }, []);

  const desactivarUsuario = async (id: number) => {
    const ok = confirm("¿Desactivar usuario?");
    if (!ok) return;

    await fetch('http://localhost:3000/admin/desactivar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const data = await getUsuarios();
    setUsuarios(data);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

      <div className="bg-white rounded-xl shadow p-4">

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2">ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Admin</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id_usuario} className="text-center border-t">

                <td className="p-2">{u.id_usuario}</td>

                <td>
                  {u.nombre} {u.apellido_paterno}
                </td>

                <td>{u.telefono}</td>

                <td>
                  <span className={`px-2 py-1 rounded text-white text-xs ${
                    u.es_activo ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {u.es_activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td>
                  {u.es_administrador ? 'Sí' : 'No'}
                </td>

                <td>
                  <button
                    onClick={() => desactivarUsuario(u.id_usuario)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Desactivar
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
}