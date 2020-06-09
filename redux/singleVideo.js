import axios from 'axios';
import { fetchVideos } from './videos';
import { setError, setErrorRegistered } from './error';

const SET_SELECTED_VIDEO = 'SET_SELECTED_VIDEO';
const CLEAR_SELECTED_VIDEO = 'CLEAR_SELECTED_VIDEO'

const setSelectedVideo = video => {
  return {
    type: SET_SELECTED_VIDEO,
    video
  }

};

const clearSelectedVideo = () => {
  return {
    type: CLEAR_SELECTED_VIDEO,
    video: {},
  }
}

export const singleVideoReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SELECTED_VIDEO:
      return action.video;
    case CLEAR_SELECTED_VIDEO:
      return action.video;
    default:
      return state;
  }
}

export const setVideo = id => {
  return dispatch => {
    axios.get(`https://duette.herokuapp.com/api/video/${id}`)
      .then(video => {
        dispatch(setSelectedVideo(video.data))
      })
      .catch(e => {
        console.log('error in setVideo: ', e)
        throw new Error('error in setVideo thunk: ', e)
      })
  }
};

export const clearVideo = () => {
  return dispatch => {
    return dispatch(clearSelectedVideo())
  }
};

export const updateVideo = (userId, videoId, updatedDetails, searchText) => {
  return dispatch => {
    axios.put(`https://duette.herokuapp.com/api/video/${videoId}/${userId}`, updatedDetails)
      .then(() => {
        dispatch(setErrorRegistered());
        dispatch(fetchVideos(searchText));
      })
      .catch(e => {
        console.log('error in updateVideo: ', e)
        dispatch(setError(e))
      })
  }
}

