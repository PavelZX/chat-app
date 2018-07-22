import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'muicss/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SocialButton = (props) => {
  return (
    <Button
      className={`button button-${props.socialMedia}`}
      size="large"
      variant="raised"
      onClick={props.handleSocialLogin}
      disabled={props.isDisabled}
    >
      <div className="social-icon">
        <FontAwesomeIcon icon={["fab", props.socialMediaIcon]} size="2x" />
      </div>
      {props.label}
    </Button>
  );
}

SocialButton.propTypes = {
  socialMedia: PropTypes.string.isRequired,
  socialMediaIcon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  handleSocialLogin: PropTypes.func,
  isDisabled: PropTypes.bool
}

SocialButton.defaultProps = {
  handleSocialLogin: () => {},
  isDisabled: false
}

export default SocialButton;