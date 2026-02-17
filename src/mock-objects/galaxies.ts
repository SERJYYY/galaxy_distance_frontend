// src/mocks/galaxies.ts

import m101 from "../assets/m101_vertushka.jpg";
import ngc3982 from "../assets/NGC_3982.jpg";
import ngc4424 from "../assets/NGC_4424.jpg";
import ngc4526 from "../assets/NGC_4526.jpg";
// import ugc9391 from "../assets/UGC_9391.jpg";


export interface Galaxy {
  id: number;
  name: string;
  magnitude: number;
  distance: number;
  image_url?: string;
  description: string;
}

export const mockGalaxies: Galaxy[] = [
  {
    id: 1,
    name: "M101",
    magnitude: 7.86,
    distance: 6.4,
    image_url: m101,
    description:
      "M101 — это спиральная галактика в созвездии Большой Медведицы, известная своими яркими спиральными рукавами.",
  },
  {
    id: 2,
    name: "NGC 3982",
    magnitude: 12.0,
    distance: 17.0,
    image_url: ngc3982,
    description:
      "NGC 3982 — спиральная галактика с активными областями звездообразования в созвездии Большой Медведицы.",
  },
  {
    id: 3,
    name: "NGC 4424",
    magnitude: 11.1,
    distance: 16.0,
    image_url: ngc4424,
    description:
      "NGC 4424 — спиральная галактика с нарушенной структурой спиральных рукавов, находящаяся в созвездии Девы.",
  },
  {
    id: 4,
    name: "NGC 4526",
    magnitude: 10.2,
    distance: 16.4,
    image_url: ngc4526,
    description:
      "NGC 4526 — линзообразная галактика с заметной пылевой полосой, расположена в созвездии Девы.",
  },
  {
    id: 5,
    name: "UGC 9391",
    magnitude: 13.5,
    distance: 20.1,
    image_url: "",
    description:
      "UGC 9391 — спиральная галактика малой яркости, изучаемая для определения расстояния по сверхновым типа Ia.",
  },
];
