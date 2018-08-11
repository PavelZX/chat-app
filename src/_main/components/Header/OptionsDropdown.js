import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar } from '../../../components/Avatar';
import './styles.scss';

class OptionsDropdown extends Component {
  constructor(props) {
    super(props);
  }
  handleLogout(event) {
    event.preventDefault();

    const { handleLogout } = this.props;

    handleLogout();
  }
  render() {
    const { user } = this.props;

    return (
      <div className="mui-dropdown options-dropdown">
        <MediaQuery query="(min-width: 768px)">
          <div className="user-details">
            <Avatar
              image={user.profilePicture}
              title={user.name}
              accountType={user.accountType}
            />
            <div className="user-name">
              {user.name}
            </div>
          </div>
        </MediaQuery>
        <div>
          <button className="mui-btn mui-btn--small mui-btn--fab" data-mui-toggle="dropdown">
            <div className="dropdown-icon">
              <FontAwesomeIcon icon="ellipsis-v" size="2x" />
            </div>
          </button>
          <ul className="dropdown-menu mui-dropdown__menu mui-dropdown__menu--right">
            <li>
              <a href="#" onClick={::this.handleLogout}>
                <div className="option-icon">
                  <FontAwesomeIcon icon="sign-out-alt" />
                </div>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

OptionsDropdown.propTypes = {
  user: PropTypes.object.isRequired,
  handleLogout: PropTypes.func.isRequired
}

export default OptionsDropdown;