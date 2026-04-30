import { vectorizerService } from './vectorizer';
import { aiClient } from './ai-client';
import { createAdminClient } from '@/utils/supabase/admin';

async function runStressTest() {
  const supabase = createAdminClient();
  
  console.log('--- INICIO PRUEBA DE FUEGO ---');
  
  // 0. Verificar salud de APIs
  const health = await aiClient.checkHealth();
  console.log('Salud de APIs:', health);
  
  // 1. Obtener un documento real para la prueba
  const { data: doc, error: docError } = await supabase.from('documents').select('id, org_id').limit(1).single();
  
  if (docError || !doc || !doc.org_id) {
    console.error('Error: No se encontró ningún documento válido o con org_id en la base de datos para realizar la prueba.');
    console.error('Detalle:', docError);
    return;
  }

  console.log(`Usando documento: ${doc.id} de la organización ${doc.org_id}`);

  // 2. Crear una versión de prueba ficticia (Híbrido de lo que hemos visto)
  const { data: version, error: vError } = await supabase.from('document_versions').insert({
    document_id: doc.id,
    version_number: 1,
    file_url: 'stress_test.txt'
  }).select().single();

  if (vError) {
    console.error('Error creando versión de prueba:', vError);
    return;
  }

  // 3. Generar contenido extenso (~50,000 caracteres / ~50-100 chunks)
  console.log('Generando contenido extenso para simular documento de 50 páginas...');
  const largeContent = Array(100).fill(0).map((_, i) => 
    `Párrafo ${i + 1}: Este es un párrafo técnico de prueba para el sistema de Strategic Connex. 
    Contiene información crítica sobre el procedimiento industrial número ${1000 + i}. 
    El RUT asociado a este registro es 76.${100 + i}.456-K. 
    Referencia ISO 9001:2015 cláusula 7.${(i % 10) + 1}. 
    Se recomienda revisar los estándares de seguridad en plataformas marítimas periódicamente.`
  ).join('\n\n');

  console.log(`Iniciando vectorización de ${largeContent.length} caracteres...`);
  const startTime = Date.now();

  try {
    const result = await vectorizerService.vectorizeDocumentVersion(
      version.id,
      doc.id,
      largeContent,
      doc.org_id,
      supabase
    );

    const duration = (Date.now() - startTime) / 1000;
    
    console.log('--- RESULTADOS DE LA PRUEBA ---');
    console.log(`Estado: ${result.success ? 'ÉXITO' : 'FALLO'}`);
    console.log(`Total Chunks: ${result.totalChunks}`);
    console.log(`Tiempo total: ${duration.toFixed(2)}s`);
    console.log(`Promedio por chunk: ${(duration / result.totalChunks).toFixed(2)}s`);
    
    if (result.error) console.error(`Error detalle: ${result.error}`);

  } catch (err) {
    console.error('Error fatal en la prueba:', err);
  } finally {
    // Limpieza opcional (borrar versión de test)
    // await supabase.from('document_versions').delete().eq('id', version.id);
  }
}

runStressTest();
