const TOGGLE_INFO = 'TOGGLE_INFO';

export const toggleRequestReview = bool => {
  return {
    type: TOGGLE_INFO,
    bool
  }

};

export const requestReviewReducer = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_INFO:
      return action.bool;
    default:
      return state;
  }
};
