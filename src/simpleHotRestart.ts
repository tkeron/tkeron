
(async () => {
    let cp = "";
    const offline = document.createElement("div");
    offline.innerHTML = `
        NOW OFFLINE
        <style>
            .offline {
                position: fixed;
                top: 15px;
                left: 15px;
                border-radius: 5px;
                padding: 10px;
                background: #0009;
                color: #fff;
                font-size: 30px;
                font-weight: bold;
                z-index: 999;
                user-select: none;
            }
        </style>
    `;
    offline.classList.add("offline");
    //@ts-ignore
    offline.showed = false;
    const review = async () => {
        const cb = new Date().getTime();
        const compdate = await fetch("/compdate.txt?cb=" + cb).then(_ => _.text())
            .catch(_ => "error");
        if (compdate === "error") {
            //@ts-ignore
            if (!offline.showed) {
                document.body.appendChild(offline);
                //@ts-ignore
                offline.showed = true;
            }
            setTimeout(review, 618 * 5);
            return;
        }
        //@ts-ignore
        if (offline.showed) {
            document.body.removeChild(offline);
            //@ts-ignore
            offline.showed = false;
        }

        if (cp === "") cp = compdate;
        if (compdate === "reload...") location.reload();
        if (cp !== compdate) location.reload();
        setTimeout(review, 618 * 3);
    };
    review();
})();


