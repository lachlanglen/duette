const TOGGLE_OVERLAY = 'TOGGLE_OVERLAY';

export const toggleUpgradeOverlay = bool => {
  return {
    type: TOGGLE_OVERLAY,
    bool
  }

};

export const displayUpgradeOverlay = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_OVERLAY:
      return action.bool;
    default:
      return state;
  }
};
