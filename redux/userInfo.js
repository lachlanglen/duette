const TOGGLE_INFO = 'TOGGLE_INFO';

export const toggleUserInfo = bool => {
  return {
    type: TOGGLE_INFO,
    bool
  }

};

export const displayUserInfoReducer = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_INFO:
      return action.bool;
    default:
      return state;
  }
};
