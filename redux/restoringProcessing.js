const UPDATE_RESTORING_PROCESSING = 'UPDATE_RESTORING_PROCESSING';

export const updateRestoringProcessing = bool => {
  return {
    type: UPDATE_RESTORING_PROCESSING,
    bool
  }

};

export const restoringProcessingReducer = (state = false, action) => {
  switch (action.type) {
    case UPDATE_RESTORING_PROCESSING:
      return action.bool;
    default:
      return state;
  }
};
