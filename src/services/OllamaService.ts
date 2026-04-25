export interface ReajusteAnalysisInput {
  masterPlanYear: number;
  divisionPlanYear: number;
  divisionName: string;
  missingSheets: string[];
  extraSheets: string[];
  matchedSheets: string[];
  requiresPonderamiento: boolean;
}

export interface ReajusteAnalysisResult {
  model: string;
  recommendation: string;
}

export class OllamaService {
  private static ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  private static ollamaModel = process.env.OLLAMA_MODEL || 'mistral';

  static async analyzeReajuste(input: ReajusteAnalysisInput): Promise<ReajusteAnalysisResult> {
    const prompt = this.buildPrompt(input);

    const response = await fetch(this.ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.ollamaModel,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as { response?: string };
    const recommendation = data.response?.trim();

    if (!recommendation) {
      throw new Error('Ollama returned an empty response');
    }

    return {
      model: this.ollamaModel,
      recommendation,
    };
  }

  private static buildPrompt(input: ReajusteAnalysisInput): string {
    return [
      'Eres un asistente experto en planificación económica empresarial.',
      'Tu tarea es proponer reajustes concretos para alinear el plan divisional con el plan maestro.',
      'Responde SIEMPRE en español y en formato claro con secciones cortas.',
      '',
      'CONTEXTO:',
      `- Año plan maestro: ${input.masterPlanYear}`,
      `- Año plan divisional: ${input.divisionPlanYear}`,
      `- División: ${input.divisionName}`,
      `- ¿Requiere ponderamiento?: ${input.requiresPonderamiento ? 'Sí' : 'No'}`,
      `- Hojas faltantes en división: ${input.missingSheets.length ? input.missingSheets.join(', ') : 'Ninguna'}`,
      `- Hojas extra en división: ${input.extraSheets.length ? input.extraSheets.join(', ') : 'Ninguna'}`,
      `- Hojas coincidentes: ${input.matchedSheets.length ? input.matchedSheets.join(', ') : 'Ninguna'}`,
      '',
      'INSTRUCCIONES DE RESPUESTA:',
      '1) Da un diagnóstico breve (2-3 líneas).',
      '2) Lista acciones priorizadas (máximo 6) para el reajuste.',
      '3) Indica si aplicar ponderamiento y cómo hacerlo en pasos simples.',
      '4) Termina con una recomendación operativa para el administrador.',
    ].join('\n');
  }
}
