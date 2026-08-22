/**
 * Deep statistical & taste profiling analyzer for AniList data.
 */

function calculateMean(arr) {
  if (!arr || arr.length === 0) return null;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return Number((sum / arr.length).toFixed(2));
}

function calculateMedian(arr) {
  if (!arr || arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return Number(sorted[mid].toFixed(2));
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

function calculateStdDev(arr, mean) {
  if (!arr || arr.length <= 1) return 0;
  const m = mean !== undefined ? mean : calculateMean(arr);
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (arr.length - 1);
  return Number(Math.sqrt(variance).toFixed(2));
}

/**
 * Deep statistical taste analyzer.
 */
export class AniListAnalyzer {
  constructor(parsedData) {
    this.parsedData = parsedData;
    this.user = parsedData.user || {};
    this.allAnime = parsedData.all_anime || [];
    this.categorized = parsedData.categorized_by_status || {};
  }

  analyze() {
    return {
      user_summary: {
        username: this.user.name,
        user_id: this.user.id,
        score_format: this.user.score_format,
        avatar: this.user.avatar
      },
      consumption_overview: this._analyzeConsumption(),
      rating_statistics: this._analyzeRatings(),
      community_divergence: this._analyzeDivergence(),
      genre_analytics: this._analyzeGenres(),
      studio_analytics: this._analyzeStudios(),
      temporal_and_format_analytics: this._analyzeTemporalAndFormats(),
      drop_friction_analytics: this._analyzeDrops(),
      rewatch_analytics: this._analyzeRewatches()
    };
  }

  _analyzeConsumption() {
    const totalAnime = this.allAnime.length;
    const statusBreakdown = {};

    for (const [st, items] of Object.entries(this.categorized)) {
      statusBreakdown[st] = {
        count: items.length,
        percentage: totalAnime > 0 ? Number(((items.length / totalAnime) * 100).toFixed(2)) : 0
      };
    }

    let totalEpisodesWatched = 0;
    let totalMinutesWatched = 0;

    for (const item of this.allAnime) {
      const progress = item.progress.episodes_watched || 0;
      const repeat = item.progress.repeat_count || 0;
      const duration = item.watch_time.episode_duration_minutes || 24;
      const totalEps = progress * (repeat + 1);

      totalEpisodesWatched += totalEps;
      totalMinutesWatched += totalEps * duration;
    }

    const totalHours = Number((totalMinutesWatched / 60).toFixed(2));
    const totalDays = Number((totalHours / 24).toFixed(2));

    const completedCount = this.categorized.completed?.length || 0;
    const watchingCount = this.categorized.watching?.length || 0;
    const droppedCount = this.categorized.dropped?.length || 0;
    const pausedCount = this.categorized.paused?.length || 0;

    const activeEngaged = completedCount + watchingCount + droppedCount + pausedCount;
    const completionRate = activeEngaged > 0 ? Number(((completedCount / activeEngaged) * 100).toFixed(2)) : 0;

    return {
      total_anime: totalAnime,
      status_breakdown: statusBreakdown,
      total_episodes_watched: totalEpisodesWatched,
      total_time_spent: {
        minutes: totalMinutesWatched,
        hours: totalHours,
        days: totalDays
      },
      completion_rate_percentage: completionRate
    };
  }

  _analyzeRatings() {
    const ratedItems = this.allAnime.filter(item => item.my_rating.is_rated);
    const unratedItems = this.allAnime.filter(item => !item.my_rating.is_rated);

    const scores = ratedItems.map(item => item.my_rating.raw);
    const countRated = scores.length;
    const countTotal = this.allAnime.length;

    if (countRated === 0) {
      return {
        rated_count: 0,
        unrated_count: countTotal,
        rated_percentage: 0,
        user_mean_score: null,
        user_median_score: null,
        user_std_deviation: null,
        min_score: null,
        max_score: null,
        score_distribution_tiers: {}
      };
    }

    const meanVal = calculateMean(scores);
    const medianVal = calculateMedian(scores);
    const stdDev = calculateStdDev(scores, meanVal);
    const minVal = Math.min(...scores);
    const maxVal = Math.max(...scores);

    const tiers = {
      masterpiece_90_100: 0,
      great_80_89: 0,
      good_70_79: 0,
      average_60_69: 0,
      mediocre_50_59: 0,
      poor_below_50: 0
    };

    for (const s of scores) {
      if (s >= 90) tiers.masterpiece_90_100++;
      else if (s >= 80) tiers.great_80_89++;
      else if (s >= 70) tiers.good_70_79++;
      else if (s >= 60) tiers.average_60_69++;
      else if (s >= 50) tiers.mediocre_50_59++;
      else tiers.poor_below_50++;
    }

    const tierPercentages = {};
    for (const [k, v] of Object.entries(tiers)) {
      tierPercentages[k] = {
        count: v,
        percentage: Number(((v / countRated) * 100).toFixed(2))
      };
    }

    const communityScores = ratedItems
      .filter(item => item.community_rating.average_score !== null)
      .map(item => item.community_rating.average_score);

    const commMean = calculateMean(communityScores);
    const ratingBias = commMean !== null ? Number((meanVal - commMean).toFixed(2)) : null;

    let biasVerdict = "Neutral";
    if (ratingBias !== null) {
      if (ratingBias > 5) biasVerdict = `Generous (+${ratingBias} above community average)`;
      else if (ratingBias < -5) biasVerdict = `Critical (${ratingBias} below community average)`;
      else biasVerdict = `Balanced (${ratingBias >= 0 ? "+" : ""}${ratingBias} deviation from community)`;
    }

    return {
      rated_count: countRated,
      unrated_count: unratedItems.length,
      rated_percentage: countTotal > 0 ? Number(((countRated / countTotal) * 100).toFixed(2)) : 0,
      user_mean_score: meanVal,
      user_median_score: medianVal,
      user_std_deviation: stdDev,
      min_score: minVal,
      max_score: maxVal,
      community_mean_for_rated: commMean,
      rating_bias: ratingBias,
      rating_tendency: biasVerdict,
      score_distribution_tiers: tierPercentages
    };
  }

  _analyzeDivergence() {
    const divergentItems = [];
    const userScores = [];
    const commScores = [];

    for (const item of this.allAnime) {
      if (item.my_rating.is_rated && item.community_rating.average_score !== null) {
        const uScore = item.my_rating.raw;
        const cScore = item.community_rating.average_score;
        const diff = Number((uScore - cScore).toFixed(2));

        userScores.push(uScore);
        commScores.push(cScore);

        divergentItems.push({
          title: item.title.user_preferred,
          user_score: uScore,
          community_score: cScore,
          difference: diff,
          status: item.status,
          media_id: item.media_id,
          url: item.links.site_url
        });
      }
    }

    let correlation = null;
    if (userScores.length > 2) {
      const meanU = calculateMean(userScores);
      const meanC = calculateMean(commScores);
      let num = 0;
      let denU = 0;
      let denC = 0;

      for (let i = 0; i < userScores.length; i++) {
        const du = userScores[i] - meanU;
        const dc = commScores[i] - meanC;
        num += du * dc;
        denU += du * du;
        denC += dc * dc;
      }

      const den = Math.sqrt(denU * denC);
      if (den > 0) {
        correlation = Number((num / den).toFixed(3));
      }
    }

    const sortedByDiff = [...divergentItems].sort((a, b) => b.difference - a.difference);
    const topHigher = sortedByDiff.filter(i => i.difference > 0).slice(0, 10);
    const topLower = [...divergentItems].sort((a, b) => a.difference - b.difference).filter(i => i.difference < 0).slice(0, 10);

    return {
      community_alignment_correlation: correlation,
      top_user_higher_than_community: topHigher,
      top_user_lower_than_community: topLower
    };
  }

  _analyzeGenres() {
    const genreMap = new Map();

    for (const item of this.allAnime) {
      const genres = item.media_details.genres || [];
      const status = item.status;
      const progress = item.progress.episodes_watched || 0;
      const repeat = item.progress.repeat_count || 0;
      const eps = progress * (repeat + 1);
      const duration = item.watch_time.episode_duration_minutes || 24;
      const isRated = item.my_rating.is_rated;
      const rawScore = item.my_rating.raw;
      const commScore = item.community_rating.average_score;

      for (const g of genres) {
        if (!genreMap.has(g)) {
          genreMap.set(g, {
            count: 0,
            completed: 0,
            dropped: 0,
            watching: 0,
            total_episodes: 0,
            total_minutes: 0,
            user_scores: [],
            community_scores: []
          });
        }

        const gd = genreMap.get(g);
        gd.count++;
        if (status === "completed") gd.completed++;
        else if (status === "dropped") gd.dropped++;
        else if (status === "watching") gd.watching++;

        gd.total_episodes += eps;
        gd.total_minutes += eps * duration;

        if (isRated) gd.user_scores.push(rawScore);
        if (commScore !== null && commScore !== undefined) gd.community_scores.push(commScore);
      }
    }

    const breakdown = {};
    for (const [g, gd] of genreMap.entries()) {
      const userMean = calculateMean(gd.user_scores);
      const commMean = calculateMean(gd.community_scores);
      const delta = (userMean !== null && commMean !== null) ? Number((userMean - commMean).toFixed(2)) : null;
      const compRate = gd.count > 0 ? Number(((gd.completed / gd.count) * 100).toFixed(2)) : 0;
      const dropRate = gd.count > 0 ? Number(((gd.dropped / gd.count) * 100).toFixed(2)) : 0;

      breakdown[g] = {
        anime_count: gd.count,
        completed_count: gd.completed,
        dropped_count: gd.dropped,
        completion_rate: compRate,
        drop_rate: dropRate,
        total_episodes_watched: gd.total_episodes,
        total_hours_watched: Number((gd.total_minutes / 60).toFixed(2)),
        user_mean_score: userMean,
        user_rated_count: gd.user_scores.length,
        community_mean_score: commMean,
        score_delta: delta
      };
    }

    const favGenres = Object.entries(breakdown)
      .filter(([_, stats]) => stats.user_mean_score !== null && stats.user_rated_count >= 3)
      .map(([genre, stats]) => ({ genre, ...stats }))
      .sort((a, b) => b.user_mean_score - a.user_mean_score)
      .slice(0, 5);

    const mostWatched = Object.entries(breakdown)
      .map(([genre, stats]) => ({ genre, ...stats }))
      .sort((a, b) => b.anime_count - a.anime_count)
      .slice(0, 5);

    return {
      all_genres_breakdown: breakdown,
      favorite_genres_by_score: favGenres,
      most_watched_genres_by_count: mostWatched
    };
  }

  _analyzeStudios() {
    const studioMap = new Map();

    for (const item of this.allAnime) {
      const studio = item.media_details.main_studio;
      if (!studio || studio === "Unknown Studio") continue;

      const status = item.status;
      const progress = item.progress.episodes_watched || 0;
      const repeat = item.progress.repeat_count || 0;
      const eps = progress * (repeat + 1);
      const isRated = item.my_rating.is_rated;
      const rawScore = item.my_rating.raw;
      const commScore = item.community_rating.average_score;

      if (!studioMap.has(studio)) {
        studioMap.set(studio, {
          count: 0,
          completed: 0,
          dropped: 0,
          total_episodes: 0,
          user_scores: [],
          community_scores: [],
          titles: []
        });
      }

      const sd = studioMap.get(studio);
      sd.count++;
      if (status === "completed") sd.completed++;
      else if (status === "dropped") sd.dropped++;

      sd.total_episodes += eps;
      sd.titles.push(item.title.user_preferred);

      if (isRated) sd.user_scores.push(rawScore);
      if (commScore !== null && commScore !== undefined) sd.community_scores.push(commScore);
    }

    const breakdown = {};
    for (const [s, sd] of studioMap.entries()) {
      const userMean = calculateMean(sd.user_scores);
      const commMean = calculateMean(sd.community_scores);
      const delta = (userMean !== null && commMean !== null) ? Number((userMean - commMean).toFixed(2)) : null;

      breakdown[s] = {
        anime_count: sd.count,
        completed_count: sd.completed,
        dropped_count: sd.dropped,
        total_episodes_watched: sd.total_episodes,
        user_mean_score: userMean,
        user_rated_count: sd.user_scores.length,
        community_mean_score: commMean,
        score_delta: delta,
        titles_sample: sd.titles.slice(0, 5)
      };
    }

    const mostWatched = Object.entries(breakdown)
      .map(([studio, stats]) => ({ studio, ...stats }))
      .sort((a, b) => b.anime_count - a.anime_count)
      .slice(0, 10);

    const highestRated = Object.entries(breakdown)
      .filter(([_, stats]) => stats.user_mean_score !== null && stats.user_rated_count >= 2)
      .map(([studio, stats]) => ({ studio, ...stats }))
      .sort((a, b) => b.user_mean_score - a.user_mean_score)
      .slice(0, 10);

    return {
      all_studios_breakdown: breakdown,
      most_watched_studios: mostWatched,
      highest_rated_studios: highestRated
    };
  }

  _analyzeTemporalAndFormats() {
    const decadeMap = new Map();
    const formatMap = new Map();

    for (const item of this.allAnime) {
      const decade = item.media_details.decade;
      const fmt = item.media_details.format;
      const progress = item.progress.episodes_watched || 0;
      const repeat = item.progress.repeat_count || 0;
      const eps = progress * (repeat + 1);
      const isRated = item.my_rating.is_rated;
      const rawScore = item.my_rating.raw;

      if (!decadeMap.has(decade)) decadeMap.set(decade, { count: 0, scores: [], episodes: 0 });
      const dd = decadeMap.get(decade);
      dd.count++;
      dd.episodes += eps;
      if (isRated) dd.scores.push(rawScore);

      if (!formatMap.has(fmt)) formatMap.set(fmt, { count: 0, scores: [], episodes: 0 });
      const fd = formatMap.get(fmt);
      fd.count++;
      fd.episodes += eps;
      if (isRated) fd.scores.push(rawScore);
    }

    const byDecade = {};
    for (const [d, data] of Array.from(decadeMap.entries()).sort()) {
      byDecade[d] = {
        anime_count: data.count,
        total_episodes: data.episodes,
        user_mean_score: calculateMean(data.scores)
      };
    }

    const byFormat = {};
    const sortedFormats = Array.from(formatMap.entries()).sort((a, b) => b[1].count - a[1].count);
    for (const [f, data] of sortedFormats) {
      byFormat[f] = {
        anime_count: data.count,
        total_episodes: data.episodes,
        user_mean_score: calculateMean(data.scores)
      };
    }

    return {
      by_decade: byDecade,
      by_format: byFormat
    };
  }

  _analyzeDrops() {
    const dropped = this.categorized.dropped || [];
    if (dropped.length === 0) {
      return {
        total_dropped: 0,
        drop_rate_percentage: 0,
        average_dropped_episode: null,
        dropped_titles: []
      };
    }

    const dropEps = dropped.map(d => d.progress.episodes_watched || 0);
    const avgDropEp = calculateMean(dropEps);

    const droppedTitles = dropped.map(d => ({
      title: d.title.user_preferred,
      episodes_watched: d.progress.episodes_watched,
      total_episodes: d.progress.total_episodes,
      user_rating: d.my_rating.raw,
      genres: d.media_details.genres,
      notes: d.notes
    }));

    const totalAll = this.allAnime.length;
    const dropRate = totalAll > 0 ? Number(((dropped.length / totalAll) * 100).toFixed(2)) : 0;

    return {
      total_dropped: dropped.length,
      drop_rate_percentage: dropRate,
      average_dropped_episode: avgDropEp,
      dropped_titles: droppedTitles
    };
  }

  _analyzeRewatches() {
    const rewatched = this.allAnime.filter(item => (item.progress.repeat_count || 0) > 0);
    rewatched.sort((a, b) => b.progress.repeat_count - a.progress.repeat_count);

    return {
      total_rewatched_titles: rewatched.length,
      rewatched_list: rewatched.map(item => ({
        title: item.title.user_preferred,
        repeat_count: item.progress.repeat_count,
        user_score: item.my_rating.raw,
        total_episodes: item.progress.total_episodes
      }))
    };
  }
}
