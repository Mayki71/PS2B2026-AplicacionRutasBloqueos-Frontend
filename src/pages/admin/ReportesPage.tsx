import { useEffect, useState } from 'react';
import { getReportes } from '../../modules/admin/services/adminService';

export default function ReportesPage() {

  const [reportes, setReportes] = useState<any[]>([]);

  useEffect(() => {
    getReportes().then(setReportes);
  }, []);

  const resolverReporte = async (id: number) => {
    await fetch('http://localhost:3000/admin/cambiar-estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado: 2 }) // 2 = resuelto
    });

    const data = await getReportes();
    setReportes(data);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Gestión de Reportes</h1>

      <div className="bg-white rounded-xl shadow p-4">

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {reportes.map((r) => (
              <tr key={r.id_reporte} className="text-center border-t">

                <td>{r.id_reporte}</td>

                <td>
                  {r.usuarios?.nombre} {r.usuarios?.apellido_paterno}
                </td>

                <td>{r.descripcion}</td>

                <td>
                  <span className="bg-yellow-400 text-white px-2 py-1 rounded text-xs">
                    {r.estados_reporte?.nombre_estado}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => resolverReporte(r.id_reporte)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Resolver
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