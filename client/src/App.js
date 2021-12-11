import Chart from 'chart.js/auto';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const canvas = useRef();

  async function getData() {
    const res = await axios.get('./api/data');

    createChart(res.data);
  }

  function createChart(inCommingData) {
    console.log(inCommingData[0]);

    const labels = new Set();

    const counts = {};
    const views = {};
    const AverageViews = {};
    const durations = {};

    inCommingData.forEach((item) => {
      labels.add(String(item.year));

      if (!counts[String(item.year)]) {
        counts[String(item.year)] = 0;
      }
      if (!views[String(item.year)]) {
        views[String(item.year)] = 0;
      }
      if (!AverageViews[String(item.year)]) {
        AverageViews[String(item.year)] = 0;
      }
      if (!durations[String(item.year)]) {
        durations[String(item.year)] = 0;
      }

      counts[String(item.year)] += 1;
      views[String(item.year)] += Number(item.viewCount) / 1000000;
      AverageViews[String(item.year)] += Number(item.viewCount);
      durations[String(item.year)] += item.seconds;
    });

    const data = {
      labels: Array.from(labels).reverse(),
      datasets: [
        {
          label: 'number of videos',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: Object.values(counts),
        },
        {
          label: 'views / 1M',
          backgroundColor: 'rgb(150, 200, 250)',
          borderColor: 'rgb(150, 200, 250)',
          data: Object.values(views),
        },
        {
          label: 'average view / 1000',
          backgroundColor: 'rgb(50, 150, 50)',
          borderColor: 'rgb(50, 150, 50)',
          data: Object.keys(AverageViews).map(
            (yearNum) => AverageViews[yearNum] / counts[yearNum] / 1000
          ),
        },
        {
          label: 'average duration / 10',
          backgroundColor: 'rgb(50, 50, 150)',
          borderColor: 'rgb(50, 50, 150)',
          data: Object.keys(durations).map(
            (yearNum) => durations[yearNum] / counts[yearNum] / 10
          ),
        },
      ],
    };

    new Chart(canvas.current.getContext('2d'), {
      type: 'line',
      data,
      options: {},
    });
  }

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <canvas ref={canvas}></canvas>
    </div>
  );
}

export default App;
