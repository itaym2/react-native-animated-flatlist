import { Dimensions, Animated, Easing } from 'react-native';
const { width } = Dimensions.get('window');

const createAnimationSpec = () => {
    const translateX = new Animated.Value(0);
    
    const animatedViewStyle = { transform: [{ translateX: translateX }] }
    
    const animate = (callback) => Animated.timing(translateX, {
        toValue: -1 * width,
        duration: 1000,
        easing: Easing.out(Easing.poly(3)),
    }).start(callback)
    
    const reset = () => translateX.setValue(0);

    { animatedViewStyle, animate, reset };
}