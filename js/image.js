load();

function load() {
  axios.get(`https://exptech.com.tw/api/v1/images`)
    .then((res) => {
      const data = res.data;
      document.getElementById("eew").src = `https://api.exptech.com.tw/file${data.eew}?v=${Date.now()}`;
      document.getElementById("report").src = `https://api.exptech.com.tw/file${data.report}?v=${Date.now()}`;
      document.getElementById("i-cwb").src = `https://api.exptech.com.tw/file${data.intensity.cwb}?v=${Date.now()}`;
      document.getElementById("i-trem").src = `https://api.exptech.com.tw/file${data.intensity.trem}?v=${Date.now()}`;
    })
}

setInterval(() => load(), 60_000);