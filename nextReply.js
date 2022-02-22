const nextReply = (data, numReplies, participants) => {
  let randomReplyIndex = Math.floor(Math.random() * numReplies);
  let randomReplyObject = data[randomReplyIndex];
  while (participants.filter(p => p.name === randomReplyObject.name).length === 0) {
    randomReplyIndex = Math.floor(Math.random() * numReplies);
    randomReplyObject = data[randomReplyIndex];
  }
  let selectedParticipants;
  if (participants.length > 7) {
    const guessesArray = participants.filter(
      (participant) => participant.name !== randomReplyObject.name
    );
    const shuffledGuessesArray = guessesArray
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    const slicedShuffledGuessesArray = shuffledGuessesArray.slice(0, 6);
    slicedShuffledGuessesArray.push({ name: randomReplyObject.name });
    const shuffledGuesses = slicedShuffledGuessesArray
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    selectedParticipants = shuffledGuesses;
    selectedParticipants = selectedParticipants.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i)
  } else {
    const shuffledGuesses = participants
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    selectedParticipants = shuffledGuesses;
    selectedParticipants = selectedParticipants.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i)
  }
  return {
    answer: randomReplyObject.name,
    reply: randomReplyObject.message,
    selectedParticipants: selectedParticipants,
  };
};

module.exports = nextReply;
