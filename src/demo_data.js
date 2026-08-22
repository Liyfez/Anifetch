/**
 * Realistic mock dataset for testing and demoing anifetch without network access.
 */
export const MOCK_DEMO_COLLECTION = {
  user: {
    id: 999999,
    name: "AnimeEnthusiast",
    mediaListOptions: { scoreFormat: "POINT_100" },
    avatar: { large: "https://anilist.co/img/icons/icon.svg" }
  },
  lists: [
    {
      name: "Completed",
      isCustomList: false,
      status: "COMPLETED",
      entries: [
        {
          id: 1,
          status: "COMPLETED",
          score: 100,
          progress: 24,
          repeat: 2,
          notes: "Peak fiction! Unmatched storytelling and character development.",
          startedAt: { year: 2023, month: 1, day: 10 },
          completedAt: { year: 2023, month: 1, day: 15 },
          media: {
            id: 9253,
            idMal: 9253,
            title: {
              userPreferred: "Steins;Gate",
              english: "Steins;Gate",
              romaji: "Steins;Gate",
              native: "シュタインズ・ゲート"
            },
            format: "TV",
            status: "FINISHED",
            episodes: 24,
            duration: 24,
            season: "SPRING",
            seasonYear: 2011,
            genres: ["Drama", "Psychological", "Sci-Fi", "Thriller"],
            tags: [{ name: "Time Travel", rank: 98, category: "Theme" }],
            averageScore: 90,
            meanScore: 90,
            popularity: 380000,
            favourites: 35000,
            studios: { nodes: [{ id: 1, name: "White Fox", isAnimationStudio: true }] },
            allStudios: { edges: [{ isMain: true, node: { id: 1, name: "White Fox", isAnimationStudio: true } }] },
            siteUrl: "https://anilist.co/anime/9253"
          }
        },
        {
          id: 2,
          status: "COMPLETED",
          score: 98,
          progress: 64,
          repeat: 1,
          startedAt: { year: 2023, month: 3, day: 1 },
          completedAt: { year: 2023, month: 3, day: 25 },
          media: {
            id: 5114,
            title: {
              userPreferred: "Fullmetal Alchemist: Brotherhood",
              english: "Fullmetal Alchemist: Brotherhood",
              romaji: "Hagane no Renkinjutsushi: FULLMETAL ALCHEMIST"
            },
            format: "TV",
            status: "FINISHED",
            episodes: 64,
            duration: 24,
            season: "SPRING",
            seasonYear: 2009,
            genres: ["Action", "Adventure", "Drama", "Fantasy"],
            averageScore: 90,
            popularity: 450000,
            studios: { nodes: [{ id: 2, name: "bones", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/5114"
          }
        },
        {
          id: 3,
          status: "COMPLETED",
          score: 96,
          progress: 26,
          repeat: 0,
          media: {
            id: 1,
            title: { userPreferred: "Cowboy Bebop", english: "Cowboy Bebop", romaji: "Cowboy Bebop" },
            format: "TV",
            episodes: 26,
            duration: 24,
            seasonYear: 1998,
            genres: ["Action", "Adventure", "Drama", "Sci-Fi"],
            averageScore: 86,
            studios: { nodes: [{ id: 3, name: "Sunrise", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/1"
          }
        },
        {
          id: 4,
          status: "COMPLETED",
          score: 95,
          progress: 1,
          repeat: 1,
          media: {
            id: 199,
            title: { userPreferred: "Spirited Away", english: "Spirited Away", romaji: "Sen to Chihiro no Kamikakushi" },
            format: "MOVIE",
            episodes: 1,
            duration: 125,
            seasonYear: 2001,
            genres: ["Adventure", "Drama", "Fantasy", "Supernatural"],
            averageScore: 88,
            studios: { nodes: [{ id: 4, name: "Studio Ghibli", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/199"
          }
        },
        {
          id: 5,
          status: "COMPLETED",
          score: 92,
          progress: 26,
          repeat: 0,
          media: {
            id: 205,
            title: { userPreferred: "Samurai Champloo", english: "Samurai Champloo", romaji: "Samurai Champloo" },
            format: "TV",
            episodes: 26,
            duration: 24,
            seasonYear: 2004,
            genres: ["Action", "Adventure", "Comedy"],
            averageScore: 84,
            studios: { nodes: [{ id: 5, name: "Manglobe", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/205"
          }
        },
        {
          id: 6,
          status: "COMPLETED",
          score: 90,
          progress: 12,
          repeat: 0,
          media: {
            id: 101921,
            title: { userPreferred: "Kaguya-sama: Love is War", english: "Kaguya-sama: Love is War", romaji: "Kaguya-sama wa Kokurasetai" },
            format: "TV",
            episodes: 12,
            duration: 24,
            seasonYear: 2019,
            genres: ["Comedy", "Psychological", "Romance", "Slice of Life"],
            averageScore: 83,
            studios: { nodes: [{ id: 6, name: "A-1 Pictures", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/101921"
          }
        },
        {
          id: 7,
          status: "COMPLETED",
          score: 85,
          progress: 10,
          repeat: 0,
          media: {
            id: 130592,
            title: { userPreferred: "Cyberpunk: Edgerunners", english: "Cyberpunk: Edgerunners", romaji: "Cyberpunk: Edgerunners" },
            format: "ONA",
            episodes: 10,
            duration: 24,
            seasonYear: 2022,
            genres: ["Action", "Drama", "Sci-Fi"],
            averageScore: 85,
            studios: { nodes: [{ id: 7, name: "TRIGGER", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/130592"
          }
        },
        {
          id: 8,
          status: "COMPLETED",
          score: 65,
          progress: 12,
          repeat: 0,
          media: {
            id: 10087,
            title: { userPreferred: "Fate/Zero", english: "Fate/Zero", romaji: "Fate/Zero" },
            format: "TV",
            episodes: 13,
            duration: 24,
            seasonYear: 2011,
            genres: ["Action", "Fantasy", "Supernatural"],
            averageScore: 83,
            studios: { nodes: [{ id: 8, name: "ufotable", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/10087"
          }
        },
        {
          id: 9,
          status: "COMPLETED",
          score: 45,
          progress: 24,
          repeat: 0,
          media: {
            id: 1210,
            title: { userPreferred: "Welcome to the N.H.K.", english: "Welcome to the N.H.K.", romaji: "NHK ni Youkoso!" },
            format: "TV",
            episodes: 24,
            duration: 24,
            seasonYear: 2006,
            genres: ["Comedy", "Drama", "Psychological"],
            averageScore: 82,
            studios: { nodes: [{ id: 9, name: "GONZO", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/1210"
          }
        }
      ]
    },
    {
      name: "Watching",
      isCustomList: false,
      status: "CURRENT",
      entries: [
        {
          id: 10,
          status: "CURRENT",
          score: 0,
          progress: 8,
          media: {
            id: 178025,
            title: { userPreferred: "Gachiakuta", english: "Gachiakuta", romaji: "Gachiakuta" },
            format: "TV",
            episodes: 24,
            duration: 24,
            seasonYear: 2025,
            genres: ["Action", "Drama", "Fantasy"],
            averageScore: 82,
            studios: { nodes: [{ id: 2, name: "bones", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/178025"
          }
        }
      ]
    },
    {
      name: "Dropped",
      isCustomList: false,
      status: "DROPPED",
      entries: [
        {
          id: 11,
          status: "DROPPED",
          score: 40,
          progress: 4,
          notes: "Pacing was too slow for me",
          media: {
            id: 1575,
            title: { userPreferred: "Code Geass", english: "Code Geass", romaji: "Code Geass" },
            format: "TV",
            episodes: 25,
            duration: 24,
            seasonYear: 2006,
            genres: ["Action", "Drama", "Mecha", "Sci-Fi"],
            averageScore: 84,
            studios: { nodes: [{ id: 3, name: "Sunrise", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/1575"
          }
        }
      ]
    },
    {
      name: "Planning",
      isCustomList: false,
      status: "PLANNING",
      entries: [
        {
          id: 12,
          status: "PLANNING",
          score: 0,
          progress: 0,
          media: {
            id: 20954,
            title: { userPreferred: "A Silent Voice", english: "A Silent Voice", romaji: "Koe no Katachi" },
            format: "MOVIE",
            episodes: 1,
            duration: 130,
            seasonYear: 2016,
            genres: ["Drama", "Romance", "Slice of Life"],
            averageScore: 89,
            studios: { nodes: [{ id: 10, name: "Kyoto Animation", isAnimationStudio: true }] },
            siteUrl: "https://anilist.co/anime/20954"
          }
        }
      ]
    }
  ]
};
