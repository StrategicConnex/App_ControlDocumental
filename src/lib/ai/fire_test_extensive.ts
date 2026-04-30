import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { aiClient } from './ai-client';

async function fireTestExtensive() {
  console.log('🔥 INICIANDO PRUEBA DE FUEGO - PROCESAMIENTO EXTENSO');
  console.log('---------------------------------------------------');

  const orgId = '7b9e6f1a-2c3d-4e5f-8a9b-0c1d2e3f4g5h'; // Org ID de prueba
  
  // 1. Cargar el documento extenso (SRS)
  const srsPath = path.resolve(process.cwd(), 'srs_gestion_documental.md');
  if (!fs.existsSync(srsPath)) {
    console.error('❌ Error: No se encontró srs_gestion_documental.md');
    return;
  }
  
  const srsContent = fs.readFileSync(srsPath, 'utf-8');
  console.log(`📄 Documento cargado: ${srsPath} (${srsContent.length} caracteres)`);

  // 2. Ejecutar auditoría de cumplimiento del SRS usando el POL
  console.log('\n🤖 Solicitando Auditoría Estructural al Orquestador (POL)...');
  
  const startTime = Date.now();
  
  try {
    const response = await aiClient.chat([
      { 
        role: 'system', 
        content: 'Eres un Auditor de Sistemas Senior. Tu tarea es analizar el siguiente SRS y detectar posibles inconsistencias técnicas, riesgos de seguridad en el modelo de datos o contradicciones en los flujos de negocio.' 
      },
      { 
        role: 'user', 
        content: `Analiza este documento extenso y genera un reporte crítico de 3 puntos clave sobre la arquitectura propuesta:\n\n${srsContent}` 
      }
    ], orgId, { strategy: 'balanced' });

    const duration = Date.now() - startTime;

    console.log('\n✅ RESULTADO EXITOSO');
    console.log('---------------------------------------------------');
    console.log(`Provider: ${response.provider}`);
    console.log(`Modelo:   ${response.model}`);
    console.log(`Tiempo:   ${duration}ms (Latencia reportada: ${response.latency}ms)`);
    console.log(`Tokens:   P:${response.usage.prompt_tokens} | C:${response.usage.completion_tokens} | T:${response.usage.total_tokens}`);
    console.log('---------------------------------------------------');
    console.log('\n📝 REPORTE DEL AUDITOR AI:');
    console.log(response.content);
    console.log('---------------------------------------------------');

  } catch (error: any) {
    console.error('\n❌ ERROR EN LA PRUEBA DE FUEGO:');
    console.error(error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
  }

  console.log('\n🔥 Prueba de fuego finalizada.');
}

fireTestExtensive().catch(console.error);
