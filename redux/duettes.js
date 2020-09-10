import axios from 'axios';

const SET_DUETTES = 'SET_DUETTES';

export const setDuettes = duettes => {
  return {
    type: SET_DUETTES,
    duettes
  }

};

export const userDuettesReducer = (state = [], action) => {
  switch (action.type) {
    case SET_DUETTES:
      return action.duettes;
    default:
      return state;
  }
}

export const fetchDuettes = (userId, onSuccess, onFailure) => {
  // console.log("userId in fetchDuettes: ", userId)
  return dispatch => {
    axios.get(`https://duette.herokuapp.com/api/duette/byUserId/${userId}`)
      .then(duettes => {
        dispatch(setDuettes(duettes.data))
        if (onSuccess) onSuccess();
      })
      .catch(e => {
        if (onFailure) onFailure();
        throw new Error('error in fetchDuettes thunk: ', e)
      })
  };
};

export const postDuette = (details) => {
  return dispatch => {
    axios.post('https://duette.herokuapp.com/api/duette', details)
      .then(() => dispatch(fetchDuettes(details.userId)))
      .catch(e => {
        throw new Error('error in postDuette thunk: ', e)
      })
  };
};

export const deleteDuette = ({ duetteId, videoId, userId, onSuccess, onFailure }) => {
  return dispatch => {
    axios.delete(`https://duette.herokuapp.com/api/duette/${duetteId}/${userId}`)
      .then(() => axios.delete(`https://duette.herokuapp.com/api/aws/${videoId}${duetteId}.mov`))
      .then(() => axios.delete(`https://duette.herokuapp.com/api/aws/${videoId}${duetteId}thumbnail.mov`))
      .then(() => {
        dispatch(fetchDuettes(userId));
        onSuccess();
      })
      .catch(e => {
        onFailure();
        throw new Error('error in deleteDuette thunk: ', e)
      })
  }
}

