import React, { Component } from 'react';
import { Dimensions, Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';


class AnimatedFlatListItem extends Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.shouldRemove) {
            if (this.props.shouldAnimate) {
                this.props.animate(nextProps.onItemRemoved);
            } else {
                nextProps.onItemRemoved();
            }
        } else {
            if (this.props.shouldRemove) {
                this.props.reset();
            }
        }
    }

    render() {
        return (
            <Animated.View style={this.props.animatedViewStyle}>
                {this.props.children}
            </Animated.View>
        );
    }
}

AnimatedFlatListItem.propTypes = {
    shouldRemove: PropTypes.bool,
    onItemRemoved: PropTypes.func,
    children: PropTypes.element,
    shouldAnimate: PropTypes.bool,
};

export default AnimatedFlatListItem;