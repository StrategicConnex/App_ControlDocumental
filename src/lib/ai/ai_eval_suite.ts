import { vectorizerService, HybridSearchResult } from './vectorizer';

/**
 * Interface for a test case in the evaluation suite.
 */
interface TestCase {
  query: string;
  expectedDocumentId: string; // The ID of the document that SHOULD be found
  description: string;
}

/**
 * Results of the evaluation.
 */
interface EvalResults {
  totalTests: number;
  recallAt1: number;
  recallAt5: number;
  mrr: number;
  failures: Array<{ query: string; expected: string; foundRank: number }>;
}

/**
 * Evaluation Suite for Strategic Connex AI Search.
 */
export class AIEvalSuite {
  private testCases: TestCase[] = [
    {
      query: "procedimiento de seguridad en plataformas",
      expectedDocumentId: "DOC-SEC-001", // Placeholder
      description: "Búsqueda semántica general"
    },
    {
      query: "RUT 76.123.456-K",
      expectedDocumentId: "DOC-INV-999", // Placeholder
      description: "Búsqueda de palabra clave exacta (RUT)"
    },
    {
      query: "ISO 9001:2015 clausula 7.5",
      expectedDocumentId: "DOC-ISO-001", // Placeholder
      description: "Búsqueda técnica específica"
    }
  ];

  /**
   * Ejecuta la suite de evaluación.
   */
  async runEval(orgId: string): Promise<EvalResults> {
    let hitsAt1 = 0;
    let hitsAt5 = 0;
    let reciprocalRankSum = 0;
    const failures: any[] = [];

    for (const test of this.testCases) {
      try {
        const results: HybridSearchResult[] = await vectorizerService.searchSimilarChunks(test.query, orgId, 5);
        
        const rank = results.findIndex(r => r.document_id === test.expectedDocumentId || r.metadata?.title?.includes(test.expectedDocumentId));
        
        if (rank === 0) hitsAt1++;
        if (rank >= 0 && rank < 5) hitsAt5++;
        
        if (rank >= 0) {
          reciprocalRankSum += 1 / (rank + 1);
        } else {
          failures.push({ query: test.query, expected: test.expectedDocumentId, foundRank: -1 });
        }

      } catch (error) {
        console.error(`Error evaluando query "${test.query}":`, error);
      }
    }

    const n = this.testCases.length;
    return {
      totalTests: n,
      recallAt1: hitsAt1 / n,
      recallAt5: hitsAt5 / n,
      mrr: reciprocalRankSum / n,
      failures
    };
  }
}

export const aiEvalSuite = new AIEvalSuite();
