const UPDATE_TRANSACTION_PROCESSING = 'UPDATE_TRANSACTION_PROCESSING';

export const updateTransactionProcessing = bool => {
  return {
    type: UPDATE_TRANSACTION_PROCESSING,
    bool
  }

};

export const transactionProcessingReducer = (state = false, action) => {
  switch (action.type) {
    case UPDATE_TRANSACTION_PROCESSING:
      return action.bool;
    default:
      return state;
  }
};
