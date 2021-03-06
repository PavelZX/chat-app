import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { slide as Menu } from 'react-burger-menu';
import mapDispatchToProps from '../../../actions';
import './styles.scss';

class LeftSideDrawer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      handleLeftSideDrawerToggleState,
      isLeftSideDrawerOpen,
      noOverlay,
      children
    } = this.props;

    return (
      <Menu
        overlayClassName={"left-side-drawer-overlay"}
        width="250px"
        isOpen={isLeftSideDrawerOpen}
        onStateChange={handleLeftSideDrawerToggleState}
        noOverlay={noOverlay}
      >
        <div className="left-side-drawer">
          {children}
        </div>
      </Menu>
    );
  }
}

const mapStateToProps = (state) => {
  return {}
}

LeftSideDrawer.propTypes = {
  handleLeftSideDrawerToggleState: PropTypes.func.isRequired,
  isLeftSideDrawerOpen: PropTypes.bool,
  noOverlay: PropTypes.bool
}

LeftSideDrawer.defaultProps = {
  isLeftSideDrawerOpen: false,
  noOverlay: false
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LeftSideDrawer);
