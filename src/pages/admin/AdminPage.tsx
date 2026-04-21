import { useEffect, useState } from 'react';
import { getUsuarios } from '../../modules/admin/services/adminService';

export default function AdminPage() {

  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
  getUsuarios().then(data => {
    console.log("DATA:", data);
    setUsuarios(data.data || data);
  });
}, []);

  const desactivarUsuario = async (id: number) => {
  await fetch('http://localhost:3000/admin/desactivar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  });

  // recargar usuarios
  const data = await getUsuarios();
  setUsuarios(data);
};

  return (
  <div style={{ padding: '30px', fontFamily: 'Arial' }}>
    <h1 style={{ marginBottom: '20px' }}>Panel Admin</h1>

    <p><strong>Total usuarios:</strong> {usuarios.length}</p>

    <h1 className="text-red-500 text-3xl">FUNCIONA TAILWIND</h1>

    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px'
    }}>
      <thead style={{ backgroundColor: '#333', color: '#fff' }}>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>Estado</th>
          <th>Admin</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id_usuario} style={{ textAlign: 'center' }}>
            <td>{u.id_usuario}</td>
            <td>{u.nombre} {u.apellido_paterno}</td>
            <td>{u.telefono}</td>
            <td style={{ color: u.es_activo ? 'green' : 'red' }}>
              {u.es_activo ? 'Activo' : 'Inactivo'}
            </td>
            <td>{u.es_administrador ? 'Sí' : 'No'}</td>

            <td>
              <button
                onClick={() => desactivarUsuario(u.id_usuario)}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Desactivar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}

