const shuffleArray = <T>(arr: T[]): T[] => {
  const shuffledArray = [...arr];

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[i],
    ];
  }

  return shuffledArray;
};

export const generatePermutations = (
  string: string,
  n: number,
  separator = ", "
) => {
  const MAX_ITERATIONS = n * 10;
  const array = string.split(separator);

  const results: string[] = [];

  let i = 0;
  while (results.length < n && i < MAX_ITERATIONS) {
    const result = shuffleArray(array).join(separator);
    if (!results.includes(result)) {
      results.push(result);
    }
    i += 1;
  }

  return results;
};

// console.log(
//   generatePermutations(
//     "A cat on mars, digital painting, artstation, concept art, Craig Mullins, Breathtaking, 8k resolution, extremely detailed, beautiful, establishing shot, artistic, hyperrealistic, octane render, cinematic lighting, dramatic lighting, masterpiece",
//     4
//   )
// );
