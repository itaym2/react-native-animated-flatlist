import React, { Component } from 'react';
import { FlatList } from 'react-native';
import PropTypes from 'prop-types';
import AnimatedFlatListItem from './animated-flatlist-item';
import R from 'ramda';

import createSlideOutLeftAnimation from './animations/slide-out-left'; // just for testing stuff, will be removed later

const sortItemsAccordingToNewData = (currentItems, newItems, keyExtractor, sort) => {
    const sorted = currentItems.map(i => {
        const currentItemKey = keyExtractor(i);
        const matchingItem = newItems.find(d => keyExtractor(d) === currentItemKey);

        if (matchingItem) {
            return { ...matchingItem, shouldRemove: i.shouldRemove };
        } else {
            return { ...i };
        }
    });

    sorted.sort(sort);

    return sorted;
};

class AnimatedFlatList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flatListItems: [...props.data],
            itemsToDelete: null,
        };

        this.renderItem = this.renderItem.bind(this);
        this.onItemRemoved = this.onItemRemoved.bind(this);
    }

    addItems(existingItems, itemsToAdd) {
        const newFlatListItemsSource = [...existingItems, ...itemsToAdd];
        newFlatListItemsSource.sort(this.props.sort);
        this.setState({ flatListItems: [...newFlatListItemsSource] });
    }

    removeItems(existingItems, itemsToDelete, keyExtractor) {
        const newFlatListItemsSource = existingItems.map(i => {
            if (itemsToDelete.find(d => keyExtractor(d) === keyExtractor(i))) {
                return { ...i, shouldRemove: true };
            }

            return i;
        });

        this.setState({
            itemsToDelete: itemsToDelete,
            flatListItems: newFlatListItemsSource,
        });
    }

    onItemRemoved(item) {
        const keyExtractor = this.props.keyExtractor;
        const itemsMarkedForDeletion = this.state.itemsToDelete.filter(i => keyExtractor(i) !== keyExtractor(item));

        this.setState({
            itemsToDelete: itemsMarkedForDeletion.length > 0 ? itemsMarkedForDeletion : null,
            flatListItems: [...this.props.data],
        });

        if (this.props.onItemUnmounted) {
            this.props.onItemUnmounted(item);
        }
    }

    componentWillReceiveProps({ data }) {
        const keyExtractor = this.props.keyExtractor;
        const compareByKey = (a, b) => keyExtractor(a) === keyExtractor(b);

        const itemsToDelete = R.differenceWith(compareByKey, this.props.data, data);
        const itemsToAdd = R.differenceWith(compareByKey, data, this.props.data);

        if (itemsToAdd.length > 0) {
            this.addItems(this.props.data, itemsToAdd);
        }

        if (itemsToDelete.length > 0) {
            this.removeItems(this.props.data, itemsToDelete, keyExtractor);
        }

        this.setState(currentState => {
            const sortedFlatListItems = sortItemsAccordingToNewData(
                currentState.flatListItems,
                data,
                keyExtractor,
                this.props.sort
            );

            return { flatListItems: sortedFlatListItems };
        });
    }

    renderItem({ item, index }) {
        const animationSpec = createSlideOutLeftAnimation();
        
        return (
            <AnimatedFlatListItem
                animate={animationSpec.animate}
                reset={animationSpec.reset}
                animatedViewStyle={animationSpec.animatedViewStyle}
                shouldRemove={item.shouldRemove}
                shouldAnimate={this.props.shouldAnimateItem(item)}
                onItemRemoved={() => this.onItemRemoved(item)}
            >
                {this.props.renderItem({ item, index })}
            </AnimatedFlatListItem >
        );
    }

    render() {
        const { data, renderItem, ...other } = this.props;
        return <FlatList data={this.state.flatListItems} renderItem={this.renderItem} {...other} />;
    }
}

AnimatedFlatList.propTypes = {
    rowHasChanged: PropTypes.func,
    data: PropTypes.array,
    renderItem: PropTypes.func,
    onItemUnmounted: PropTypes.func,
    shouldAnimateItem: PropTypes.func,
    keyExtractor: PropTypes.func.isRequired,
    sort: PropTypes.func.isRequired,
};

export default AnimatedFlatList;