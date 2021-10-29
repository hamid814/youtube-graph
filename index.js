const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');

const Video = require('./video');

dotenv.config({ path: './config/config.env' });

const state = {
  nextPageToken: null,
  channelId: 'UC-b3c7kxa5vU-bnmaROgvog',
  uploadsPlayListId: 'UU-b3c7kxa5vU-bnmaROgvog',
  totalResults: null,
};

const videos = [];

const endpoints = {
  playList:
    'https://youtube.googleapis.com/youtube/v3/playlistItems?part=id,snippet',
  video:
    'https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails,statistics',
};

const write = (txt) => {
  fs.writeFileSync('./data', txt);
};

const read = () => {
  return fs.readFileSync('./data', { encoding: 'utf8' });
};

const getVideoById = (id) => {
  return videos.filter((video) => {
    return video.id === id;
  })[0];
};

const app = async () => {
  const listRes = await axios.get(endpoints.playList, {
    params: {
      key: process.env.YT_API_KEY,
      maxResults: 50,
      playlistId: state.uploadsPlayListId,
      pageToken: state.nextPageToken,
    },
  });

  listRes.data.items.forEach((item) => {
    const video = new Video(item.snippet.resourceId.videoId);
    video.publishedAt = item.snippet.publishedAt;

    videos.push(video);
  });

  state.nextPageToken = listRes.data.nextPageToken;

  // save total results
  if (!state.totalResults) {
    state.totalResults = listRes.data.pageInfo.totalResults;
  }

  const ids = listRes.data.items.map((item) => {
    return item.snippet.resourceId.videoId;
  });

  // get video details
  const videoRes = await axios.get(endpoints.video, {
    params: {
      key: process.env.YT_API_KEY,
      id: ids.join(','),
    },
  });

  // save details of videos
  videoRes.data.items.forEach((item) => {
    const video = getVideoById(item.id);

    video.apiDuration = item.contentDetails.duration;
    video.viewCount = item.statistics.viewCount;
  });

  write(JSON.stringify(videos, null, 2));

  console.log(videos.length, state.totalResults);

  if (videos.length < state.totalResults) {
    app();
  }
};

const processData = () => {
  let data = read();
  data = JSON.parse(data);

  data.forEach((item) => {
    item.year = new Date(item.publishedAt).getFullYear();
    item.viewCountNumber = Number(item.viewCount);

    let apiDuration = item.apiDuration.slice(2, item.apiDuration.length);

    let seconds = 0;

    if (apiDuration.search('H') !== -1) {
      seconds += Number(apiDuration.split('H')[0]) * 3600;

      if (apiDuration.split('H').length === 1) {
        return;
      } else {
        apiDuration = apiDuration.slice(
          apiDuration.search('H') + 1,
          apiDuration.length
        );
      }
    }

    if (apiDuration.search('M') !== -1) {
      seconds += Number(apiDuration.split('M')[0]) * 60;

      if (apiDuration.split('M').length === 1) {
        return;
      } else {
        apiDuration = apiDuration.slice(
          apiDuration.search('M') + 1,
          apiDuration.length
        );
      }
    }

    if (apiDuration.search('S') !== -1) {
      seconds += Number(apiDuration.split('S')[0]);
    }

    item.seconds = seconds;
  });

  // data = data.map((item) => item.apiDuration);

  fs.writeFileSync('./data', JSON.stringify(data, null, 2));
};

// app();
processData();
