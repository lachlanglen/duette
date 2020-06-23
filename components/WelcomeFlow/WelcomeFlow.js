import React from 'react';
import { connect } from 'react-redux';
import SubscribeModal from './SubscribeModal';
import WelcomeModal from './WelcomeModal';

const WelcomeFlow = (props) => {

  return (
    !props.user.id ? (
      <WelcomeModal />
    ) : (
        <SubscribeModal />
      )
  )
};

const mapState = ({ user }) => {
  return {
    user,
  }
}

export default connect(mapState)(WelcomeFlow);
