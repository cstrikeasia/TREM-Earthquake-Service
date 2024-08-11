load();

function load() {
  axios.get(`https://api-1.exptech.dev/file/images/eew/json/`).then((res) => {
    document.getElementById(
      "eew"
    ).src = `https://api-1.exptech.dev/file/images/eew/${res.data.at(-1).name}`;
  });
  axios
    .get(`https://api-1.exptech.dev/file/images/report/json/`)
    .then((res) => {
      document.getElementById(
        "report"
      ).src = `https://api-1.exptech.dev/file/images/report/${
        res.data.at(-1).name
      }`;
    });
  axios.get(`https://api-1.exptech.dev/file/images/lpgm/json/`).then((res) => {
    document.getElementById(
      "lpgm"
    ).src = `https://api-1.exptech.dev/file/images/lpgm/${
      res.data.at(-1).name
    }`;
  });
  axios
    .get(`https://api-1.exptech.dev/file/images/intensity/json/`)
    .then((res) => {
      document.getElementById(
        "intensity"
      ).src = `https://api-1.exptech.dev/file/images/intensity/${
        res.data.at(-1).name
      }`;
    });
}

setInterval(() => load(), 60_000);
