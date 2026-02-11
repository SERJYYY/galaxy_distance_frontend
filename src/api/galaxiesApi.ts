import { api } from "./axios";

export interface Galaxy {
  id: number;
  name: string;
  magnitude: number;
  distance: number;
  image_url?: string;
  description: string;
}

export const getGalaxies = async (): Promise<Galaxy[]> => {
  const response = await api.get("/galaxies/");
  return response.data;
};

export const getGalaxyById = async (id: number): Promise<Galaxy> => {
  const response = await api.get(`/galaxies/${id}/`);
  return response.data;
};
