load();

function load() {
  axios.get(`https://exptech.dev/api/v1/images`).then((res) => {
    const data = res.data;
    document.getElementById("eew").src = `https://${URL_MAIN}/file${
      data.eew
    }?v=${Date.now()}`;
    document.getElementById("report").src = `https://${URL_MAIN}/file${
      data.report
    }?v=${Date.now()}`;
    document.getElementById("i-cwb").src = `https://${URL_MAIN}/file${
      data.intensity.cwb
    }?v=${Date.now()}`;
    document.getElementById("i-trem").src = `https://${URL_MAIN}/file${
      data.intensity.trem
    }?v=${Date.now()}`;
  });
}

setInterval(() => load(), 60_000);
