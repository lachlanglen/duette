import React from 'react';
import { connect } from 'react-redux';
import NewUserModal from './NewUserModal';
import WelcomeModal from './WelcomeModal';

const WelcomeFlow = (props) => {

  return (
    !props.user.id ? (
      <WelcomeModal />
    ) : (
        <NewUserModal />
      )
  )
};

const mapState = ({ user }) => {
  return {
    user,
  }
}

export default connect(mapState)(WelcomeFlow);
