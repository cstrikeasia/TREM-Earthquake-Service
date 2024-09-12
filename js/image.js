load();

function load() {
  axios.get(`https://${URL_MAIN}/file/images/eew/json/`).then((res) => {
    document.getElementById("eew").src = `https://${URL_MAIN}/file/images/eew/${
      res.data.at(-1).name
    }`;
  });
  axios.get(`https://${URL_MAIN}/file/images/report/json/`).then((res) => {
    document.getElementById(
      "report"
    ).src = `https://${URL_MAIN}/file/images/report/${res.data.at(-1).name}`;
  });
  axios.get(`https://${URL_MAIN}/file/images/lpgm/json/`).then((res) => {
    document.getElementById(
      "lpgm"
    ).src = `https://${URL_MAIN}/file/images/lpgm/${res.data.at(-1).name}`;
  });
  axios.get(`https://${URL_MAIN}/file/images/intensity/json/`).then((res) => {
    document.getElementById(
      "intensity"
    ).src = `https://${URL_MAIN}/file/images/intensity/${res.data.at(-1).name}`;
  });
}

setInterval(() => load(), 60_000);
