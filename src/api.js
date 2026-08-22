/**
 * AniList GraphQL API client using native fetch.
 */

const ANILIST_GRAPHQL_ENDPOINT = "https://graphql.anilist.co";
const USER_AGENT = "anifetch-cli/1.0.0";

const MEDIA_LIST_QUERY = `
query ($userName: String, $type: MediaType) {
  MediaListCollection(userName: $userName, type: $type) {
    lists {
      name
      isCustomList
      status
      entries {
        id
        status
        score(format: POINT_100)
        progress
        repeat
        notes
        startedAt {
          year
          month
          day
        }
        completedAt {
          year
          month
          day
        }
        updatedAt
        createdAt
        media {
          id
          idMal
          title {
            romaji
            english
            native
            userPreferred
          }
          format
          status
          episodes
          duration
          season
          seasonYear
          startDate {
            year
            month
            day
          }
          genres
          tags {
            name
            rank
            category
          }
          averageScore
          meanScore
          popularity
          favourites
          studios(isMain: true) {
            nodes {
              id
              name
              isAnimationStudio
            }
          }
          allStudios: studios {
            edges {
              isMain
              node {
                id
                name
                isAnimationStudio
              }
            }
          }
          coverImage {
            large
            medium
            color
          }
          bannerImage
          siteUrl
        }
      }
    }
    user {
      id
      name
      about
      avatar {
        large
        medium
      }
      bannerImage
      siteUrl
      mediaListOptions {
        scoreFormat
      }
      statistics {
        anime {
          count
          meanScore
          standardDeviation
          minutesWatched
          episodesWatched
        }
      }
    }
  }
}
`;

/**
 * Fetches user anime collection from AniList GraphQL API with retries and rate limit handling.
 * @param {string} username - AniList username
 * @param {object} [options] - Options
 * @returns {Promise<object>}
 */
export async function fetchAniListCollection(username, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const initialDelay = options.retryDelay || 2000;

  const payload = {
    query: MEDIA_LIST_QUERY,
    variables: {
      userName: username,
      type: "ANIME"
    }
  };

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": USER_AGENT
  };

  // Optional authentication token or client ID if configured via env
  if (process.env.ANILIST_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.ANILIST_TOKEN}`;
  }
  if (process.env.ANILIST_CLIENT_ID) {
    headers["X-Client-ID"] = process.env.ANILIST_CLIENT_ID;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (response.status === 200) {
        const json = await response.json();
        if (json.errors && json.errors.length > 0) {
          throw new Error(`GraphQL Error: ${json.errors.map(e => e.message).join(", ")}`);
        }
        return json.data?.MediaListCollection || {};
      }

      if (response.status === 404) {
        throw new Error(`AniList user '${username}' not found.`);
      }

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "2", 10);
        if (options.onProgress) {
          options.onProgress(`Rate limited by AniList. Waiting ${retryAfter}s before retry...`);
        }
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, initialDelay * attempt));
      } else {
        const errorText = await response.text().catch(() => "");
        throw new Error(`AniList API request failed with status ${response.status}: ${errorText}`);
      }
    } catch (err) {
      if (attempt < maxRetries && !err.message.includes("not found")) {
        await new Promise(r => setTimeout(r, initialDelay * attempt));
      } else {
        throw err;
      }
    }
  }

  throw new Error(`Failed to fetch anime list for '${username}' after ${maxRetries} attempts.`);
}
