const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

let eq_data = [];
let trem_data = [];
let station_info = {};
let region = {};

start();

async function start() {
    showLoading();
    await fetchStationInfo();
    await fetchRegionInfo();

    const trem = await searchTrem(params.id);

    let eq = null;

    if (trem.Cwa_id) {
        document.getElementById("cwa-table").style.display = "";
        const link = document.getElementById("cwa-link");
        link.style.display = "";
        const cwa_ids = trem.Cwa_id.split("-");
        link.href = `https://www.cwa.gov.tw/V8/C/E/EQ/EQ${cwa_ids[0]}-${cwa_ids[2]}-${cwa_ids[3]}.html`;
        link.target = "_blank";

        eq = await searchEq(trem.Cwa_id);

        let loc_str = "未知區域";

        const match = eq.loc.match(/\(位於(.*?)\)/);

        if (match && match[1]) loc_str = match[1].trim();

        document.getElementById("cwa-time").textContent = formatTime(eq.time);
        document.getElementById("cwa-loc").textContent = loc_str;
        document.getElementById("cwa-lat").textContent = eq.lat;
        document.getElementById("cwa-lon").textContent = eq.lon;
        document.getElementById("cwa-depth").textContent = `${eq.depth}km`;
        document.getElementById("cwa-mag").textContent = `M ${eq.mag.toFixed(1)}`;
        const max = document.getElementById("cwa-max");
        const int = findMaxInt(eq.list);
        max.textContent = int_to_intensity(int);
        max.className = `intensity-${int}`;
    }

    document.getElementById("EventID").textContent = `EventID:  ${formatTime(Number(trem.ID)).replaceAll("/", "").replaceAll(":", "").replace(" ", "")}`;
    document.getElementById("Source").textContent = `發表單位:    TREM(${trem.Source})`;
    document.getElementById("Alert_time").textContent = `檢知時刻:    ${formatTime(Number(trem.ID))}`;

    const trem_eew = await fetchTREMEEW(params.id);

    let i = 1;
    let rts_alert = false;
    let Alarm = false;
    let Cancel = false;
    for (const eew of trem_eew) {
        const box = document.createElement("tr");

        const index = document.createElement("td");
        index.textContent = `${(eew.final) ? "#" : ""}${i}`;
        const send_time = document.createElement("td");
        send_time.textContent = formatTime(eew.time);
        const after_eq_time = document.createElement("td");
        after_eq_time.textContent = (eq) ? Math.round((eew.time - eq.time) / 1000) : "未知";
        const after_time = document.createElement("td");
        const num = Math.round((eew.time - Number(trem.ID)) / 1000);
        after_time.textContent = (num > 0) ? num : 0;
        const eq_time = document.createElement("td");
        eq_time.textContent = formatTime(eew.eq.time);
        const loc = document.createElement("td");
        loc.textContent = eew.eq.loc;
        const lat = document.createElement("td");
        lat.textContent = eew.eq.lat;
        const lon = document.createElement("td");
        lon.textContent = eew.eq.lon;
        const depth = document.createElement("td");
        depth.textContent = `${eew.eq.depth}km`;
        const mag = document.createElement("td");
        mag.textContent = `M ${eew.eq.mag.toFixed(1)}`;
        const max = document.createElement("td");
        max.textContent = (eew.eq.max) ? int_to_intensity(eew.eq.max) : "不明";
        if (eew.eq.max) max.className = `intensity-${eew.eq.max}`;
        const rts = document.createElement("td");
        rts.textContent = (eew.rts) ? "TRUE" : "";
        const method = document.createElement("td");
        method.textContent = (!eew.detail) ? "NSSPE" : "EEW";
        const reason = document.createElement("td");
        reason.textContent = eew.reason;
        const trigger = document.createElement("td");
        trigger.textContent = eew.trigger;
        const alarm = document.createElement("td");
        alarm.textContent = (eew.status == 1) ? "TRUE" : "";
        const dist = document.createElement("td");
        dist.textContent = (eq) ? distance(eew.eq.lat, eew.eq.lon)(eq.lat, eq.lon).toFixed(1) : "未知";

        box.appendChild(index);
        box.appendChild(send_time);
        box.appendChild(after_time);
        box.appendChild(after_eq_time);
        box.appendChild(eq_time);
        box.appendChild(loc);
        box.appendChild(lat);
        box.appendChild(lon);
        box.appendChild(depth);
        box.appendChild(mag);
        box.appendChild(max);
        box.appendChild(rts);
        box.appendChild(method);
        box.appendChild(reason);
        box.appendChild(trigger);
        box.appendChild(dist);
        box.appendChild(alarm);
        i++;
        document.getElementById("eew-table").appendChild(box);

        if (!rts_alert && eew.rts) {
            rts_alert = true;
            const alert_box = document.createElement("tr");
            const alert_flag = document.createElement("td");
            alert_flag.textContent = `RTS 檢知發表`;
            alert_flag.style.fontWeight = "900";
            alert_flag.colSpan = 13;
            const alert_index = document.createElement("td");
            alert_index.textContent = "〃";
            const alert_send_time = document.createElement("td");
            alert_send_time.textContent = formatTime(eew.time);
            const alert_after_eq_time = document.createElement("td");
            alert_after_eq_time.textContent = (eq) ? Math.round((eew.time - eq.time) / 1000) : "未知";
            const alert_after_time = document.createElement("td");
            const num = Math.round((eew.time - Number(trem.ID)) / 1000);
            alert_after_time.textContent = (num > 0) ? num : 0;
            alert_box.append(alert_index);
            alert_box.append(alert_send_time);
            alert_box.append(alert_after_time);
            alert_box.append(alert_after_eq_time);
            alert_box.append(alert_flag);
            document.getElementById("eew-table").appendChild(alert_box);
        }
        if (!Alarm && eew.status == 1) {
            Alarm = true;
            const alert_box = document.createElement("tr");
            const alert_flag = document.createElement("td");
            alert_flag.textContent = `警報發表`;
            alert_flag.style.fontWeight = "900";
            alert_flag.colSpan = 13;
            const alert_index = document.createElement("td");
            alert_index.textContent = "〃";
            const alert_send_time = document.createElement("td");
            alert_send_time.textContent = formatTime(eew.time);
            const alert_after_eq_time = document.createElement("td");
            alert_after_eq_time.textContent = (eq) ? Math.round((eew.time - eq.time) / 1000) : "未知";
            const alert_after_time = document.createElement("td");
            const num = Math.round((eew.time - Number(trem.ID)) / 1000);
            alert_after_time.textContent = (num > 0) ? num : 0;
            alert_box.append(alert_index);
            alert_box.append(alert_send_time);
            alert_box.append(alert_after_time);
            alert_box.append(alert_after_eq_time);
            alert_box.append(alert_flag);
            document.getElementById("eew-table").appendChild(alert_box);
        }
        if (!Cancel && eew.status == 3) {
            Alarm = true;
            const alert_box = document.createElement("tr");
            const alert_flag = document.createElement("td");
            alert_flag.textContent = `取消`;
            alert_flag.style.fontWeight = "900";
            alert_flag.colSpan = 13;
            const alert_index = document.createElement("td");
            alert_index.textContent = "〃";
            const alert_send_time = document.createElement("td");
            alert_send_time.textContent = formatTime(eew.time);
            const alert_after_eq_time = document.createElement("td");
            alert_after_eq_time.textContent = (eq) ? Math.round((eew.time - eq.time) / 1000) : "未知";
            const alert_after_time = document.createElement("td");
            const num = Math.round((eew.time - Number(trem.ID)) / 1000);
            alert_after_time.textContent = (num > 0) ? num : 0;
            alert_box.append(alert_index);
            alert_box.append(alert_send_time);
            alert_box.append(alert_after_time);
            alert_box.append(alert_after_eq_time);
            alert_box.append(alert_flag);
            document.getElementById("eew-table").appendChild(alert_box);
        }
    }

    const station_list = JSON.parse(trem.List);

    fetch("https://api-1.exptech.dev/api/v1/trem/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list: station_list }),
    })
        .then(ans => ans.json())
        .then(ans => {
            for (const ID of station_list) {
                const station = searechStationInfo(ans, ID);

                const station_id = ID.split("-")[1];

                if (!station_info[station_id]) continue;
                const box = document.createElement("tr");

                const station_loc = station_info[station_id].info.at(-1);

                const id = document.createElement("td");
                id.textContent = station_id;
                const net = document.createElement("td");
                net.textContent = station_info[station_id].net;
                const loc = document.createElement("td");
                loc.textContent = searchLocFromCode(station_loc.code);

                box.appendChild(id);
                box.appendChild(net);
                box.appendChild(loc);

                if (!station) {
                    const investigate = document.createElement("td");
                    investigate.textContent = "調查中...";
                    investigate.colSpan = 15;
                    box.appendChild(investigate);
                    document.getElementById("station-table").appendChild(box);
                    continue;
                }

                const ax = document.createElement("td");
                ax.textContent = (station_info[station_id].net == "MS-Net") ? station.ax.toFixed(4) : station.ax.toFixed(2);
                const ay = document.createElement("td");
                ay.textContent = (station_info[station_id].net == "MS-Net") ? station.ay.toFixed(4) : station.ay.toFixed(2);
                const az = document.createElement("td");
                az.textContent = (station_info[station_id].net == "MS-Net") ? station.az.toFixed(4) : station.az.toFixed(2);
                const vx = document.createElement("td");
                vx.textContent = (station_info[station_id].net == "MS-Net") ? station.vx.toFixed(4) : station.vx.toFixed(2);
                const vy = document.createElement("td");
                vy.textContent = (station_info[station_id].net == "MS-Net") ? station.vy.toFixed(4) : station.vy.toFixed(2);
                const vz = document.createElement("td");
                vz.textContent = (station_info[station_id].net == "MS-Net") ? station.vz.toFixed(4) : station.vz.toFixed(2);
                const pga = document.createElement("td");
                pga.textContent = station.pga.toFixed(2);
                const pgv = document.createElement("td");
                pgv.textContent = station.pgv.toFixed(2);
                const i = document.createElement("td");
                i.textContent = station.i;
                const I = document.createElement("td");
                const intensity = intensity_float_to_int(station.i);
                I.textContent = int_to_intensity(intensity);
                I.className = `intensity-${intensity}`;
                const sva = document.createElement("td");
                sva.textContent = station.sva;
                const lpgm = document.createElement("td");
                lpgm.textContent = station.lpgm;
                if (station.lpgm) lpgm.className = `lpgm-${station.lpgm}`;
                const start = document.createElement("td");
                start.textContent = station.start;
                const end = document.createElement("td");
                end.textContent = station.end;
                const zip = document.createElement("td");
                const link = document.createElement("a");
                link.href = `https://api-1.exptech.dev/file/trem_report/${station.ID}.zip`;
                link.target = "_blank";
                link.textContent = "zip";
                zip.append(link);

                box.appendChild(ax);
                box.appendChild(ay);
                box.appendChild(az);
                box.appendChild(vx);
                box.appendChild(vy);
                box.appendChild(vz);
                box.appendChild(pga);
                box.appendChild(pgv);
                box.appendChild(i);
                box.appendChild(I);
                box.appendChild(sva);
                box.appendChild(lpgm);
                box.appendChild(start);
                box.appendChild(end);
                box.appendChild(zip);
                document.getElementById("station-table").appendChild(box);
            }
            console.log(ans)
            hideLoading();
        })
        .catch(err => console.log(err));
}

function searechStationInfo(ans, id) {
    for (const station of ans) {
        if (station.ID == id) return station;
    }
    return null;
}

async function searchTrem(id) {
    try {
        const res = await fetch(`https://api-1.exptech.dev/api/v1/trem/list/${id}?key=${params.key}`);
        return await res.json();
    } catch (err) {
        console.log(err);
    }
}

async function searchEq(id) {
    try {
        const res = await fetch(`https://api-1.exptech.dev/api/v2/eq/report/${id}?key=${params.key}`);
        return await res.json();
    } catch (err) {
        console.log(err);
    }
}

function searchLocFromCode(code) {
    for (const city of Object.keys(region)) {
        for (const town of Object.keys(region[city])) {
            if (region[city][town].code == code) return `${city}${town}`;
        }
    }
    return "未知區域";
}

async function fetchStationInfo() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/ExpTechTW/API/master/resource/station.json");
        station_info = await res.json();
    } catch (err) {
        console.log(err);
    }
}

async function fetchRegionInfo() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/ExpTechTW/API/master/resource/region.json");
        region = await res.json();
    } catch (err) {
        console.log(err);
    }
}

async function fetchTREMEEW(id) {
    try {
        const res = await fetch(`https://api-1.exptech.dev/api/v1/trem/report/${id}`);
        return await res.json();
    } catch (err) {
        console.log(err);
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

const intensity_list = ["0", "1", "2", "3", "4", "5弱", "5強", "6弱", "6強", "7"];

function int_to_intensity(int) {
    return intensity_list[int];
}

function distance(latA, lngA) {
    return function (latB, lngB) {
        latA = latA * Math.PI / 180;
        lngA = lngA * Math.PI / 180;
        latB = latB * Math.PI / 180;
        lngB = lngB * Math.PI / 180;
        const sin_latA = Math.sin(Math.atan(Math.tan(latA)));
        const sin_latB = Math.sin(Math.atan(Math.tan(latB)));
        const cos_latA = Math.cos(Math.atan(Math.tan(latA)));
        const cos_latB = Math.cos(Math.atan(Math.tan(latB)));
        return Math.acos(sin_latA * sin_latB + cos_latA * cos_latB * Math.cos(lngA - lngB)) * 6371.008;
    };
}

function intensity_float_to_int(float) {
    return (float < 0) ? 0 : (float < 4.5) ? Math.round(float) : (float < 5) ? 5 : (float < 5.5) ? 6 : (float < 6) ? 7 : (float < 6.5) ? 8 : 9;
}

function findMaxInt(data) {
    let maxInt = null;
    for (const key of Object.keys(data))
        if (maxInt == null || data[key].int > maxInt)
            maxInt = data[key].int;
    return maxInt;
}

function showLoading() {
    document.getElementById("loading").style.display = "block";
}

function hideLoading() {
    document.getElementById("loading").style.display = "none";
}