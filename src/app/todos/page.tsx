import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: documents, error } = await supabase.from('documents').select('*')

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Documentos de Prueba</h1>
      <ul className="space-y-2">
        {documents?.map((doc: { id: string; title: string; status: string }) => (
          <li key={doc.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <span className="font-semibold text-blue-400">[{doc.status}]</span> {doc.title}
          </li>
        ))}
        {documents?.length === 0 && <p className="text-slate-400">No hay documentos aún.</p>}
      </ul>
    </div>
  )
}
