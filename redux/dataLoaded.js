const SET_LOADED = 'SET_LOADED';

export const setLoaded = bool => {
  return {
    type: SET_LOADED,
    bool
  }
};

export const dataLoadedReducer = (state = false, action) => {
  switch (action.type) {
    case SET_LOADED:
      return action.bool;
    default:
      return state;
  }
};

