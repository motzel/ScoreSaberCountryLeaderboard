export function calcPp(scores, startIdx = 0) {
    return scores.reduce(
        (cum, pp, idx) => cum + Math.pow(0.965, idx + startIdx) * pp,
        0
    );
}

export function calcRawPpAtIdx(bottomScores, idx, expected) {
    const oldBottomPp = calcPp(bottomScores, idx);
    const newBottomPp = calcPp(bottomScores, idx + 1);

    // 0.965^idx * rawPpToFind = expected + oldBottomPp - newBottomPp;
    // rawPpToFind = (expected + oldBottomPp - newBottomPp) / 0.965^idx;
    return (expected + oldBottomPp - newBottomPp) / Math.pow(0.965, idx);
}

export function findRawPp(scores, expected) {
    if (!scores.length) return expected;

    let idx = scores.length - 1;

    while (idx >= 0) {
        const bottomSlice = scores.slice(idx);
        const bottomPp = calcPp(bottomSlice, idx);

        bottomSlice.unshift(scores[idx]);
        const modifiedBottomPp = calcPp(bottomSlice, idx);
        const diff = modifiedBottomPp - bottomPp;

        if (diff > expected) {
            return calcRawPpAtIdx(scores.slice(idx + 1), idx + 1, expected);
        }

        idx--;
    }

    return calcRawPpAtIdx(scores, 0, expected);
}