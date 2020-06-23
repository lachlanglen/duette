import { combineReducers } from 'redux'
import { singleVideoReducer } from './singleVideo'
import { catsReducer } from './cats';
import { videosReducer } from './videos';
import { userReducer } from './user';
import { displayUserInfoReducer } from './userInfo';
import { userDuettesReducer } from './duettes';
import { dataLoadedReducer } from './dataLoaded';
import { requestReviewReducer } from './requestReview';
import { errorReducer } from './error';
import { displayUpgradeOverlayReducer } from './upgradeOverlay';
import { transactionProcessingReducer } from './transactionProcessing';
import { restoringProcessingReducer } from './restoringProcessing';

const appReducer = combineReducers({
  videos: videosReducer,
  selectedVideo: singleVideoReducer,
  cats: catsReducer,
  user: userReducer,
  displayUserInfo: displayUserInfoReducer,
  displayUpgradeOverlay: displayUpgradeOverlayReducer,
  userDuettes: userDuettesReducer,
  dataLoaded: dataLoadedReducer,
  requestReview: requestReviewReducer,
  transactionProcessing: transactionProcessingReducer,
  restoringProcessing: restoringProcessingReducer,
  error: errorReducer,
})

export default appReducer;
