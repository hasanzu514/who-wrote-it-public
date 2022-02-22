import { configureStore } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const wordsInitialState = {
  numReplies: null,
  reply: null,
  answer: null,
  reveal: false,
  waitingForOthers: false,
  guess: null,
  enterExample: false,
  participants: [],
  guesses: [],
  numCorrect: 0,
  numIncorrect: 0,
  table: null,
  isLoading: false,
  score: 0,
  questionNumber: 0,
  numQuestions: 10,
};

const wordsSlice = createSlice({
  name: "words",
  initialState: wordsInitialState,
  reducers: {
    setup(state, action) {
      state.numReplies = action.payload.numReplies;
      state.participants = action.payload.participants;
      state.table = action.payload.table;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload.isLoading;
    },
    setNextReply(state, action) {
      state.reply = action.payload.reply;
      state.guesses = action.payload.guesses;
      state.questionNumber = action.payload.questionNumber;
      state.numQuestions = action.payload.numQuestions;
      state.answer = null;
      state.guess = null;
      state.waitingForOthers = false;
    },
    setEnterExample(state) {
      state.enterExample = true;
    },
    setReveal(state, action) {
      state.reveal = action.payload.reveal;
    },
    setAnswer(state, action) {
      state.answer = action.payload.answer;
      if (action.payload.answer) {
        state.reveal = true;
      }
    },
    setScore(state, action) {
      state.score = action.payload.score;
      state.numCorrect = action.payload.correct;
      state.numIncorrect = action.payload.incorrect;
    },
    setSubmitAnswer(state, action) {
      state.guess = action.payload.guess;
      if (action.payload.guess) {
        state.waitingForOthers = true;
      }
    },
    setNumQuestions(state, action) {
      state.numQuestions = action.payload.numQuestions;
    },
    reset(state) {
      state.numReplies = null;
      state.reply = null;
      state.answer = null;
      state.reveal = false;
      state.waitingForOthers = false;
      state.guess = null;
      state.enterExample = false;
      state.participants = [];
      state.guesses = [];
      state.numCorrect = 0;
      state.numIncorrect = 0;
      state.table = null;
      state.isLoading = false;
      state.score = 0;
    },
  },
});

const gameSetupInitialState = {
  fileData: null,
  socialType: null,
  socket: null,
  step: null,
  host: false,
  finalScores: [],
  username: null,
  correctArray: [],
  answerTimeArray: []
};

const gameSetupSlice = createSlice({
  name: "gameSetup",
  initialState: gameSetupInitialState,
  reducers: {
    setFileData(state, action) {
      state.fileData = action.payload.fileData;
    },
    setSocialType(state, action) {
      state.socialType = action.payload.socialType;
    },
    setSocket(state, action) {
      state.socket = action.payload.socket;
    },
    setStep(state, action) {
      state.step = action.payload.step;
    },
    setHost(state, action) {
      state.host = action.payload.host;
    },
    setFinalScores(state, action) {
      state.finalScores = action.payload.finalScores;
      state.correctArray = action.payload.correctArray;
      state.answerTimeArray = action.payload.answerTimeArray;
    },
    setUsername(state, action) {
      state.username = action.payload.username
    },
    reset(state) {
      state.fileData = null;
      state.socialType = null;
      state.socket = null;
      state.step = null;
      state.host = false;
      state.finalScores = []
      state.username = null
      state.correctArray = []
      state.answerTimeArray = []
    },
  },
});

const lobbyInitialState = {
  players: [],
  code: null,
};

const lobbySlice = createSlice({
  name: "lobby",
  initialState: lobbyInitialState,
  reducers: {
    addPlayer(state, action) {
      state.players.push(action.payload.username);
    },
    setAllPlayers(state, action) {
      state.players = action.payload.usernames;
    },
    initializePlayersAndHost(state, action) {
      state.players = action.payload.usernames;
    },
    setCode(state, action) {
      state.code = action.payload.code;
    },
    reset(state) {
      state.players = [];
      state.code = null;
    },
  },
});

export const wordsActions = wordsSlice.actions;
export const gameSetupActions = gameSetupSlice.actions;
export const lobbyActions = lobbySlice.actions;

const store = configureStore({
  reducer: {
    words: wordsSlice.reducer,
    gameSetup: gameSetupSlice.reducer,
    lobby: lobbySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
