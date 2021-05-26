
(async () => {
    let cp = "";
    const review = async () => {
        const cb = new Date().getTime();
        const compdate = await fetch("/compdate.txt?cb=" + cb).then(_ => _.text())
            .catch(_ => "error");
        if (compdate === "error") {
            setTimeout(review, 618 * 5);
            return;
        }
        if (cp === "") cp = compdate;
        if (compdate === "reload...") location.reload();
        if (cp !== compdate) location.reload();
        setTimeout(review, 618 * 3);
    };
    review();
})();


