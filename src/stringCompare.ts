
export const strictRightCoincidence = (str1: string, str2: string) => {
    let res = 0;
    const s1 = str1.split("").reverse();
    const s2 = str2.split("").reverse();
    const s1l = str1.length;
    const s2l = str2.length;
    const min = s1l === s2l ? s1 : (s1l < s2l ? s1 : s2);
    const max = s1l === s2l ? s2 : (s1l > s2l ? s1 : s2);
    min.forEach((c, n) => {
        if (c === max[n]) res++
        else min.length = 0
    });
    return res;
};
