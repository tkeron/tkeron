(async () => {
  const review = async () => {
    const cb = new Date().getTime();

    const resultText = await fetch("/compdate.txt?cb=" + cb)
      .then((_) => _.text())
      .catch((_) => "");

    try {
      if (JSON.parse(resultText)?.reload) {
        location.reload();
        setTimeout(review, 618);
        return;
      }
    } catch (_) {}

    if (prevComp !== "" && resultText !== prevComp) {
      prevComp = resultText;
      location.reload();
    }

    prevComp = resultText;

    setTimeout(review, 618 * 2);
  };
  let prevComp = "";
  review();
})();
