import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'muicss/react';
import FontAwesome from 'react-fontawesome';
require('../../styles/Form.scss');

class InstagramLoginForm extends Component {
  constructor(props) {
    super(props);
  }
  handleInstagramLogin(event) {
    event.preventDefault();

    const { 
      handleInstagramLogin
    } = this.props;

    handleInstagramLogin();
  }
  render() {
    const { isLoading } = this.props;

    return (
      <Button
        className="button button-instagram"
        size="large"
        variant="raised"
        onClick={::this.handleInstagramLogin}
        disabled={isLoading}
      >
        <div className="icon">
          <FontAwesome
            name="instagram"
            size="2x"
          />
        </div>
        Login with Instagram
      </Button>
    ) 
  }
}

InstagramLoginForm.propTypes={
  handleInstagramLogin: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
}

export default InstagramLoginForm;