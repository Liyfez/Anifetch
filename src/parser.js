/**
 * AniList List Parser and Data Normalizer.
 */

const STATUS_MAP = {
  COMPLETED: "completed",
  CURRENT: "watching",
  DROPPED: "dropped",
  PAUSED: "paused",
  PLANNING: "planning",
  REPEATING: "repeating"
};

/**
 * Formats AniList date object to YYYY-MM-DD.
 * @param {object} d
 * @returns {string|null}
 */
export function formatDate(d) {
  if (!d || !d.year) return null;
  const year = String(d.year).padStart(4, "0");
  const month = String(d.month || 1).padStart(2, "0");
  const day = String(d.day || 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets release decade string.
 * @param {number|null} year
 * @returns {string}
 */
export function getDecade(year) {
  if (!year || typeof year !== "number") return "Unknown";
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}s`;
}

/**
 * Parses raw AniList GraphQL response into normalized data structure.
 * @param {object} rawCollection
 * @param {object} [filterOptions]
 * @returns {object}
 */
export function parseAniListCollection(rawCollection, filterOptions = {}) {
  const user = rawCollection.user || {};
  const rawLists = rawCollection.lists || [];

  const parsedEntries = new Map();

  for (const listObj of rawLists) {
    const listName = listObj.name || "Unknown";
    const isCustom = Boolean(listObj.isCustomList);
    const listStatus = listObj.status;

    for (const entry of listObj.entries || []) {
      const media = entry.media || {};
      const mediaId = media.id;
      if (!mediaId) continue;

      const rawStatusCode = entry.status || listStatus || "CURRENT";
      const normalizedStatus = STATUS_MAP[rawStatusCode] || rawStatusCode.toLowerCase();

      // Titles
      const titleObj = media.title || {};
      const userPreferred = titleObj.userPreferred || titleObj.romaji || "Unknown Title";
      const englishTitle = titleObj.english || null;
      const romajiTitle = titleObj.romaji || null;
      const nativeTitle = titleObj.native || null;

      // Score
      const rawScore = Number(entry.score || 0);
      const isRated = rawScore > 0;
      const score10 = isRated ? Number((rawScore / 10).toFixed(2)) : null;

      // Progress
      const progress = Number(entry.progress || 0);
      const totalEpisodes = media.episodes || null;
      let completionRate = null;
      if (totalEpisodes && totalEpisodes > 0) {
        completionRate = Number(Math.min((progress / totalEpisodes) * 100, 100).toFixed(1));
      } else if (normalizedStatus === "completed") {
        completionRate = 100.0;
      }

      // Duration & Watch time
      const duration = media.duration || 24;
      const totalMinutes = progress * duration;
      const totalHours = Number((totalMinutes / 60).toFixed(2));

      // Dates
      const startedAt = formatDate(entry.startedAt);
      const completedAt = formatDate(entry.completedAt);

      // Studios
      const mainNodes = media.studios?.nodes || [];
      const mainStudioName = mainNodes.length > 0 ? mainNodes[0].name : "Unknown Studio";

      const allStudiosSet = new Set();
      for (const edge of media.allStudios?.edges || []) {
        if (edge.node?.name) {
          allStudiosSet.add(edge.node.name);
        }
      }
      if (allStudiosSet.size === 0 && mainStudioName !== "Unknown Studio") {
        allStudiosSet.add(mainStudioName);
      }

      // Year & Decade
      const releaseYear = media.seasonYear || media.startDate?.year || null;
      const decade = getDecade(releaseYear);

      // Community metrics & delta
      const commAvg = media.averageScore !== undefined ? media.averageScore : null;
      const commMean = media.meanScore !== undefined ? media.meanScore : null;
      let scoreDiff = null;
      if (isRated && commAvg !== null) {
        scoreDiff = Number((rawScore - commAvg).toFixed(2));
      }

      const itemData = {
        entry_id: entry.id,
        media_id: mediaId,
        id_mal: media.idMal || null,
        title: {
          user_preferred: userPreferred,
          english: englishTitle,
          romaji: romajiTitle,
          native: nativeTitle
        },
        status: normalizedStatus,
        list_name: listName,
        is_custom_list: isCustom,
        my_rating: {
          raw: rawScore,
          scale_10: score10,
          is_rated: isRated
        },
        community_rating: {
          average_score: commAvg,
          mean_score: commMean,
          popularity: media.popularity || null,
          favourites: media.favourites || null
        },
        score_difference: scoreDiff,
        progress: {
          episodes_watched: progress,
          total_episodes: totalEpisodes,
          completion_percentage: completionRate,
          repeat_count: entry.repeat || 0
        },
        watch_time: {
          episode_duration_minutes: duration,
          total_minutes: totalMinutes,
          total_hours: totalHours
        },
        media_details: {
          format: media.format || "UNKNOWN",
          media_status: media.status || null,
          season: media.season || null,
          season_year: media.seasonYear || null,
          release_year: releaseYear,
          decade: decade,
          genres: media.genres || [],
          tags: (media.tags || []).filter(t => t && t.name).map(t => ({
            name: t.name,
            rank: t.rank,
            category: t.category
          })),
          main_studio: mainStudioName,
          all_studios: Array.from(allStudiosSet)
        },
        dates: {
          started_at: startedAt,
          completed_at: completedAt,
          updated_at: entry.updatedAt || null,
          created_at: entry.createdAt || null
        },
        notes: entry.notes || null,
        links: {
          site_url: media.siteUrl || `https://anilist.co/anime/${mediaId}`,
          cover_image: media.coverImage?.large || media.coverImage?.medium || null,
          banner_image: media.bannerImage || null
        }
      };

      // Deduplicate: prefer standard list or higher progress/rating
      if (parsedEntries.has(mediaId)) {
        const existing = parsedEntries.get(mediaId);
        if (existing.is_custom_list && !isCustom) {
          parsedEntries.set(mediaId, itemData);
        } else if (itemData.my_rating.is_rated && !existing.my_rating.is_rated) {
          parsedEntries.set(mediaId, itemData);
        } else if (itemData.progress.episodes_watched > existing.progress.episodes_watched) {
          parsedEntries.set(mediaId, itemData);
        }
      } else {
        parsedEntries.set(mediaId, itemData);
      }
    }
  }

  let allItems = Array.from(parsedEntries.values());

  // Apply filters if specified
  const statusFilter = filterOptions.status?.toLowerCase();
  if (statusFilter && statusFilter !== "all") {
    const statuses = statusFilter.split(",").map(s => s.trim());
    allItems = allItems.filter(item => statuses.includes(item.status));
  }

  if (filterOptions.minScore !== undefined && filterOptions.minScore !== null) {
    const minS = Number(filterOptions.minScore);
    allItems = allItems.filter(item => item.my_rating.raw >= minS);
  }

  if (filterOptions.genre) {
    const targetGenre = filterOptions.genre.toLowerCase();
    allItems = allItems.filter(item =>
      item.media_details.genres.some(g => g.toLowerCase() === targetGenre)
    );
  }

  // Sorting
  const sortField = filterOptions.sort || "score";
  const sortOrder = (filterOptions.order || "desc").toLowerCase();

  allItems.sort((a, b) => {
    let comparison = 0;
    if (sortField === "score") {
      comparison = (b.my_rating.raw || 0) - (a.my_rating.raw || 0);
    } else if (sortField === "title") {
      comparison = a.title.user_preferred.localeCompare(b.title.user_preferred);
    } else if (sortField === "episodes") {
      comparison = (b.progress.episodes_watched || 0) - (a.progress.episodes_watched || 0);
    } else if (sortField === "date") {
      const dateA = a.dates.completed_at || a.dates.started_at || "";
      const dateB = b.dates.completed_at || b.dates.started_at || "";
      comparison = dateB.localeCompare(dateA);
    } else if (sortField === "popularity") {
      comparison = (b.community_rating.popularity || 0) - (a.community_rating.popularity || 0);
    }

    if (sortOrder === "asc") {
      comparison = -comparison;
    }
    return comparison || a.title.user_preferred.localeCompare(b.title.user_preferred);
  });

  // Categorize by status
  const categorized = {
    completed: [],
    watching: [],
    dropped: [],
    paused: [],
    planning: [],
    repeating: []
  };

  for (const item of allItems) {
    if (categorized[item.status]) {
      categorized[item.status].push(item);
    } else {
      categorized[item.status] = [item];
    }
  }

  const userInfo = {
    id: user.id || null,
    name: user.name || "Unknown",
    score_format: user.mediaListOptions?.scoreFormat || "POINT_100",
    avatar: user.avatar?.large || null,
    banner_image: user.bannerImage || null,
    site_url: user.siteUrl || `https://anilist.co/user/${user.name}`
  };

  const statusCounts = {};
  for (const [st, items] of Object.entries(categorized)) {
    if (items.length > 0) {
      statusCounts[st] = items.length;
    }
  }

  return {
    user: userInfo,
    total_anime_count: allItems.length,
    status_counts: statusCounts,
    categorized_by_status: categorized,
    all_anime: allItems
  };
}
