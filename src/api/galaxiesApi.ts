import { mockGalaxies } from "../mock-objects/galaxies";

export interface Galaxy {
  id: number;
  name: string;
  magnitude: number;
  distance: number;
  image_url?: string;
  description: string;
}

export const getGalaxies = async (): Promise<Galaxy[]> => {
  try {
    const response = await fetch("/api/galaxies/");

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend недоступен. Используем mock.");
    return mockGalaxies;
  }
};

export const getGalaxyById = async (id: number): Promise<Galaxy> => {
  try {
    const response = await fetch(`/api/galaxies/${id}/`);

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend недоступен. Используем mock.");
    const galaxy = mockGalaxies.find((g) => g.id === id);

    if (!galaxy) {
      throw new Error("Galaxy not found");
    }

    return galaxy;
  }
};