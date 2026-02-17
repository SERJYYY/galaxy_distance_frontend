import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

// Кэш модели
let extractor: FeatureExtractionPipeline | null = null;

// Инициализация модели
export const getExtractor = async (): Promise<FeatureExtractionPipeline> => {
  if (!extractor) {
    console.log("Загрузка модели эмбеддингов...");
    extractor = await pipeline(
      "feature-extraction",
      "./models/all-MiniLM-L6-v2"
    );
  }
  return extractor;
};

// Преобразование Tensor → number[]
const tensorToVector = (tensor: any): number[] => {
  // tensor.data содержит Float32Array
  return Array.from(tensor.data as Float32Array);
};

// Получение эмбеддинга
export const getEmbedding = async (text: string): Promise<number[]> => {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return tensorToVector(output);
};

// Косинусная схожесть
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dot = a.reduce((sum: number, val: number, i: number) => {
    return sum + val * b[i];
  }, 0);

  const normA = Math.sqrt(
    a.reduce((sum: number, val: number) => sum + val * val, 0)
  );

  const normB = Math.sqrt(
    b.reduce((sum: number, val: number) => sum + val * val, 0)
  );

  return dot / (normA * normB);
};

// Поиск похожих элементов
export const findSimilar = async (
  targetDescription: string,
  items: { id: number; description: string }[]
) => {
  try {
    const targetEmb = await getEmbedding(targetDescription);

    const similarities = await Promise.all(
      items.map(async (item) => {
        const emb = await getEmbedding(item.description);
        const similarity = cosineSimilarity(emb, targetEmb);

        return {
          ...item,
          similarity,
        };
      })
    );

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities
      .filter((s) => s.similarity < 0.999)
      .slice(0, 5);
  } catch (err) {
    console.error("Ошибка поиска похожих:", err);
    return [];
  }
};
