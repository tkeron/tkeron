
(async () => {
    const review = async () => {
        const cb = new Date().getTime();
        const result = await fetch("/compdate.txt?cb=" + cb).then(_ => _.json())
            .catch(_ => ({ reload: false }));
        const { reload } = result as { reload: boolean };
        if (reload) {
            location.reload();
            setTimeout(review, 618);
            return;
        }
        setTimeout(review, 618 * 2);
    };
    review();
})();


