import type { Hunt } from "../types";

export const SEED_HUNTS: Hunt[] = [
  {
    id: "seed-campus",
    code: "TRAIL7",
    title: "Campus Explorer Challenge",
    description:
      "Discover hidden gems around the university campus. Navigate through iconic buildings and secret spots!",
    difficulty: "easy",
    coverImage: "https://picsum.photos/seed/campus-quest/800/450",
    creatorId: "seed",
    creatorName: "Luma Hunt Team",
    status: "published",
    createdAt: new Date("2026-01-10").toISOString(),
    clues: [
      {
        id: "campus-1",
        locationName: "The Main Library",
        lat: 42.2755,
        lng: -83.7382,
        hint: "Where knowledge lives in towering shelves — find the building with the grand stone steps and pillars at the entrance.",
        verificationDescription:
          "A large academic library building with tall stone columns, wide entrance steps, and tall arched windows.",
      },
      {
        id: "campus-2",
        locationName: "The Fountain Plaza",
        lat: 42.2744,
        lng: -83.7398,
        hint: "Water dances in the sun at the heart of campus — look for the open plaza where students gather around a fountain.",
        verificationDescription:
          "An open paved plaza with a stone or metal fountain, surrounded by benches and walking paths.",
      },
      {
        id: "campus-3",
        locationName: "The Old Oak Tree",
        lat: 42.2765,
        lng: -83.7375,
        hint: "Older than the campus itself, its branches have watched generations pass beneath them.",
        verificationDescription:
          "A very large, old oak tree with a thick trunk and wide branch canopy, likely on a grassy quad.",
      },
    ],
  },
  {
    id: "seed-park",
    code: "PARK09",
    title: "Park Mystery Quest",
    description:
      "Nature meets adventure! Explore the park's trails, gardens, and secret corners in this thrilling hunt.",
    difficulty: "hard",
    coverImage: "https://picsum.photos/seed/park-mystery/800/450",
    creatorId: "seed",
    creatorName: "Luma Hunt Team",
    status: "published",
    createdAt: new Date("2026-01-12").toISOString(),
    clues: [
      {
        id: "park-1",
        locationName: "Bethesda Fountain",
        lat: 40.7735,
        lng: -73.9705,
        hint: "An angel watches over the water where rowboats drift nearby.",
        verificationDescription:
          "A grand terraced fountain with a bronze angel statue at its center, near a lake with rowboats.",
      },
      {
        id: "park-2",
        locationName: "Bow Bridge",
        lat: 40.7757,
        lng: -73.972,
        hint: "Cross the cast-iron arch that bends like the instrument it's named for.",
        verificationDescription:
          "An ornate cast-iron pedestrian bridge arching over a lake, painted dark green or gray.",
      },
      {
        id: "park-3",
        locationName: "Belvedere Castle",
        lat: 40.7794,
        lng: -73.9692,
        hint: "A tiny stone castle on a rocky outcrop offers the best view in the park.",
        verificationDescription:
          "A small stone castle-like structure with a tower, perched on a rocky hill overlooking greenery.",
      },
    ],
  },
  {
    id: "seed-downtown",
    code: "CITY42",
    title: "Downtown Heritage Trail",
    description:
      "Follow the footsteps of history through the city's most iconic landmarks and hidden alleyways.",
    difficulty: "medium",
    coverImage: "https://picsum.photos/seed/downtown-heritage/800/450",
    creatorId: "seed",
    creatorName: "Luma Hunt Team",
    status: "published",
    createdAt: new Date("2026-01-14").toISOString(),
    clues: [
      {
        id: "downtown-1",
        locationName: "Old Meeting Hall",
        lat: 42.36,
        lng: -71.0568,
        hint: "Merchants and revolutionaries once argued beneath this same brick roof.",
        verificationDescription:
          "A historic red brick colonial-era building with a cupola on top, often surrounded by market stalls.",
      },
      {
        id: "downtown-2",
        locationName: "The Old State House",
        lat: 42.3588,
        lng: -71.0568,
        hint: "A lion and unicorn guard the gable of the oldest surviving public building nearby.",
        verificationDescription:
          "A small brick colonial building with a distinctive gabled clock tower, surrounded by modern skyscrapers.",
      },
      {
        id: "downtown-3",
        locationName: "The Central Green",
        lat: 42.355,
        lng: -71.0656,
        hint: "The oldest public park in the country, where cattle once grazed and speeches are still made.",
        verificationDescription:
          "A large open urban park with mature trees, walking paths, and open lawns bordered by city streets.",
      },
      {
        id: "downtown-4",
        locationName: "The Silversmith's House",
        lat: 42.3635,
        lng: -71.0537,
        hint: "A midnight rider's modest wooden home still stands in the North End.",
        verificationDescription:
          "A small, dark wooden colonial house with diamond-paned windows, wedged between newer brick buildings.",
      },
    ],
  },
];
