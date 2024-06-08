const utc = new Date();
        const NOW = new Date(utc.getTime() + utc.getTimezoneOffset() * 60 * 1000 + 3600 * 8 * 1000);
        const Now = formatTime(NOW.getTime() - 325000);
        const Now1 = formatTime(NOW.getTime() - 25000);

        const _stations = $("#stations");
        const _button = $("#button");
        const _start = $("#start");
        const _end = $("#end");
        _start.val(Now);
        _end.val(Now1);
        let station_data;
        let region;
        const raw_url = 'https://raw.githubusercontent.com/ExpTechTW/API/master/resource/';
        const api_url = 'https://api.exptech.com.tw/';

        axios.get(`${raw_url}region.json`)
            .then(function (res) {
                region = res.data;
                axios.get(`${raw_url}station.json`)
                    .then(function (res) {
                        station_data = res.data;
                        _stations.empty();
                        for (const id of Object.keys(station_data)) {
                            if (station_data[id].net == "SE-Net") continue;
                            const opt_station = $("<option></option>").val(id).html(`${id} | ${loc_code_to_string(station_data[id].info[station_data[id].info.length - 1].code)}`);
                            _stations.append(opt_station);
                        }
                    });
            });

        const Network = $("#Network");
        Network.on("change", function () {
            _stations.empty();
            for (const id of Object.keys(station_data)) {
                if ((Network.val() == "MS" && station_data[id].net == "SE-Net") || (Network.val() == "SE" && station_data[id].net == "MS-Net")) continue;
                const opt_station = $("<option></option>").val(id).html(`${id} | ${loc_code_to_string(station_data[id].info[station_data[id].info.length - 1].code)}`);
                _stations.append(opt_station);
            }
        });

        function loc_code_to_string(code) {
            for (const city of Object.keys(region)) {
                for (const town of Object.keys(region[city])) {
                    if (region[city][town].code == code) return `${city} ${town}`;
                }
            }
            return "未知區域";
        }

        function download() {
            _button.prop("disabled", true);
            _button.text("正在準備檔案...");
            _stations.prop("disabled", true);
            _start.prop("disabled", true);
            _end.prop("disabled", true);
            Network.prop("disabled", true);

            const data = {
                start: _start.val(),
                end: _end.val(),
                id: _stations.val(),
            }

            fetch(`${api_url}api/v1/trem/wave`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(function (res) {
                return res.json();
            }).then(function (data) {
                if (data.success) {
                    file(data.msg);
                    console.log('Success');
                } else {
                    exit();
                    const res = data.msg;
                    if (res == "Time invalid") alert("無效時間!");
                    else if (res == "Station info not found") alert("未發現 該測站資訊!");
                    else if (res == "End time error") alert("結束時間 錯誤!");
                    else if (res == "Time error") alert("起始時間 錯誤!");
                    else if (res == "Time too long") alert("選取時間段過長!");
                    else if (res == "Server busy") alert("伺服器繁忙 請稍後再試!");
                    else if (res == "No data found") alert("指定條件 查無資料!");
                    else if (res == "Failed to write file") alert("未知錯誤 請聯絡 開發人員!");
                    console.log(`Error: ${res}`);
                }
            }).catch(function (err) {
                console.log("Error: ", err.message);
                exit();
            });
        }

        function formatTime(timestamp) {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        function file(file) {
            axios({
                url: `${api_url}file/download/${file}.zip`,
                method: "GET",
                responseType: "blob",
            }).then(function (res) {
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(new Blob([res.data]));
                link.setAttribute("download", `${file}.zip`);
                document.body.appendChild(link);
                link.click();
                exit();
            }).catch(function (err) {
                console.log(err);
                exit();
                alert("下載 錯誤!");
            });
        }

        function exit() {
            _button.html('<i class="fas fa-download"></i> 下載').addClass("button_text");
            _stations.prop("disabled", false);
            _start.prop("disabled", false);
            _end.prop("disabled", false);
            _button.prop("disabled", false);
            Network.prop("disabled", false);
        }