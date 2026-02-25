// src/api/galaxiesApi.ts
import { mockGalaxies } from "../mock-objects/galaxies";

export interface Galaxy {
  id: number;
  name: string;
  magnitude: number;
  distance: number;
  image_url?: string;
  description: string;
}

export const getGalaxies = async (filterName?: string): Promise<Galaxy[]> => {
  const params = new URLSearchParams();
  if (filterName) params.append("search", filterName);

  try {
    const response = await fetch(`/api/galaxies/?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Ошибка при загрузке: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("⚠ Backend недоступен, используются моки");
    if (filterName) {
      return mockGalaxies.filter((g) =>
        g.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }
    return mockGalaxies;
  }
};

// 👇 Исправлен тип возврата: Promise<Galaxy> вместо Promise
export const getGalaxyById = async (id: number): Promise<Galaxy> => {
  try {
    const response = await fetch(`/api/galaxies/${id}/`);
    if (!response.ok) {
      throw new Error(`Ошибка при загрузке: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("⚠ Backend недоступен, используется мок");
    const galaxy = mockGalaxies.find((g) => g.id === id);
    if (!galaxy) {
      throw new Error("Галактика не найдена");
    }
    return galaxy;
  }
};