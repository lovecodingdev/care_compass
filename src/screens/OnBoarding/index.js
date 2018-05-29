import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    ImageBackground,
    View,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Orientation
} from 'react-native';

import Styles from '@OnBoardingstyles';
let { width, height } = Dimensions.get('window');// use for device height and width
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions'; // use for responsive screen UI
import Button from '@button'
import Footer from '@footer'
import Text from '@text'
import {Colors} from '@theme'
var orientation = 'PORTRAIT'
let orientationWidth=width;

let swiperprops; // use to get props for navigating to home screen

/**
*  set constuctor and initial configuration of swiper
*/
class Swiper extends Component {

  constructor(props) {
        super(props);
    }

  // Props for ScrollView component
  static defaultProps = {
    // Arrange screens horizontally
    horizontal: true,
    // Scroll exactly to the next screen, instead of continous scrolling
    pagingEnabled: true,
    // Hide all scroll indicators
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    // Do not bounce when the end is reached
    bounces: false,
    // Do not scroll to top when the status bar is tapped
    scrollsToTop: false,
    // Remove offscreen child views
    removeClippedSubviews: true,
    // Do not adjust content behind nav-, tab- or toolbars automatically
    automaticallyAdjustContentInsets: false,
    // Fisrt is screen is active
    index: 0
  };

  componentDidMount() {

    Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      orientation = width > height ? 'LANDSCAPE' : 'PORTRAIT';

    });
  }

  state = this.initState(this.props);

  /**
   * Initialize the state
   */
  initState(props) {

    // Get the total number of slides passed as children
    const total = props.children ? props.children.length || 1 : 0,
      // Current index
      index = total > 1 ? Math.min(props.index, total - 1) : 0,
      // Current offset
      offset = width * index;

    const state = {
      total,
      index,
      offset,
      width,
      height,
    };

    // Component internals as a class property,
    // and not state to avoid component re-renders when updated
    this.internals = {
      isScrolling: false,
      offset
    };

    return state;
  }

  /**
  * Scroll begin handler
  */
  onScrollBegin = e => {
    // Update internal isScrolling state
    this.internals.isScrolling = true;
  }

  /**
   * Scroll end handler
   */
  onScrollEnd = e => {
    // Update internal isScrolling state
    this.internals.isScrolling = false;

    // Update index
    this.updateIndex(e.nativeEvent.contentOffset
      ? e.nativeEvent.contentOffset.x
      // When scrolled with .scrollTo() on Android there is no contentOffset
      : e.nativeEvent.position * orientationWidth
    );
  }

  /**
  * Drag end handler
  */
  onScrollEndDrag = e => {
    const { contentOffset: { x: newOffset } } = e.nativeEvent,
      { children } = this.props,
      { index } = this.state,
      { offset } = this.internals;

    // Update internal isScrolling state
    // if swiped right on the last slide
    // or left on the first one
    if (offset === newOffset &&
      (index === 0 || index === children.length - 1)) {
      this.internals.isScrolling = false;
    }
  }

  /**
  * Update index after scroll
  */
  updateIndex = (offset) => {
    const state = this.state,
      diff = offset - this.internals.offset,
      step = orientationWidth;
    let index = state.index;

    // Do nothing if offset didn't change
    if (!diff) {
      return;
    }

    // Make sure index is always an integer
    index = parseInt(index + Math.round(diff / step), 10);

    // Update internal offset
    this.internals.offset = offset;
    // Update index in the state
    this.setState({
      index
    });
  }

  /**
  * Swipe one slide forward
  */
  swipe = () => {
    // Ignore if already scrolling or if there is less than 2 slides
    if (this.internals.isScrolling || this.state.total < 2) {
      return;
    }

    const state = this.state,
      diff = this.state.index + 1,
      x = diff * orientationWidth,
      y = 0;

    // Call scrollTo on scrollView component to perform the swipe
    this.scrollView && this.scrollView.scrollTo({ x, y, animated: true });

    // Update internal scroll state
    this.internals.isScrolling = true;

    // Trigger onScrollEnd manually on android
    if (Platform.OS === 'android') {
      setImmediate(() => {
        this.onScrollEnd({
          nativeEvent: {
            position: diff
          }
        });
      });
    }
  }

  /**
  * Swipe one slide forward
  */
  swipePrev = () => {
    // Ignore if already scrolling or if there is less than 2 slides
    if (this.internals.isScrolling || this.state.total < 2) {
      return;
    }

    const state = this.state,
      diff = this.state.index - 1,
      x = diff * orientationWidth,
      y = 0;

    // Call scrollTo on scrollView component to perform the swipe
    this.scrollView && this.scrollView.scrollTo({ x, y, animated: true });

    // Update internal scroll state
    this.internals.isScrolling = true;

    // Trigger onScrollEnd manually on android
    if (Platform.OS === 'android') {
      setImmediate(() => {
        this.onScrollEnd({
          nativeEvent: {
            position: diff
          }
        });
      });
    }
  }

  /**
  * Render ScrollView component
  */
  renderScrollView = pages => {
    return (
      <ScrollView ref={component => { this.scrollView = component; }}
        {...this.props}
        onScrollBeginDrag={this.onScrollBegin}
        onMomentumScrollEnd={this.onScrollEnd}
        onScrollEndDrag={this.onScrollEndDrag}
      >
        {pages.map((page, i) =>
          // Render each slide inside a View
          <View key={i}>
            {page}
          </View>
        )}
      </ScrollView>
    );
  }

  /**
  * Render pagination indicators
  */
  renderPagination = () => {
    if (this.state.total <= 1) {
      return null;
    }

    const ActiveDot = <View style={[Styles.dot, Styles.activeDot]} />,
      Dot = <View style={[Styles.dot]} />;

    let dots = [];

    for (let key = 0; key < this.state.total; key++) {
      dots.push(key === this.state.index
        // Active dot
        ? React.cloneElement(ActiveDot, { key })
        // Other dots
        : React.cloneElement(Dot, { key })
      );
    }

    return (
      <View
        pointerEvents="none"
        style={[Styles.pagination]}
      >
        {dots}
      </View>
    );
  }

  /**
  * Method to handle Done button click
  */
  onDone(){
    const {navigate} = swiperprops.navigation;
    navigate("DrawerStack");
  }

  /**
   * Render Next or Done button
   */
  renderButton = () => {   
   const lastScreen = this.state.index === this.state.total - 1;
    const firstScreen = this.state.index === 0;
        const secondScreen = this.state.index === 1;
    return (

       <View pointerEvents="box-none">
          {lastScreen
            ? <View style={Styles.buttonContainer}>
                <Button light bold textStyles={{color:Colors.darkNavy}} buttonStyles={Styles.buttonPrev} onPress={() => this.swipePrev()}>Previous</Button>
                <Button dark bold textStyles={{color:Colors.white}} buttonStyles={Styles.buttonNext} onPress={() => this.onDone()}>Done</Button>
              </View>
            : firstScreen
            ? <View style={Styles.buttonContainer}>
                <Button dark bold textStyles={{color:Colors.white}} buttonStyles={Styles.buttonNext} onPress={() => this.swipe()}>Next</Button>
              </View>
               :   secondScreen 
               ?  <View style={[Styles.buttonContainer]}>
                    <Button light bold textStyles={{color:Colors.darkNavy}} buttonStyles={Styles.buttonPrev} onPress={() => this.swipePrev()}>Previous</Button>
                    <Button dark bold textStyles={{color:Colors.white}} buttonStyles={Styles.buttonNext} onPress={() => this.swipe()}>Next</Button>
                  </View>
                  : null
          }
        </View>

    )
  }

  onLayout(e) {
    width = Dimensions.get('window').width
    height = Dimensions.get('window').height
 if (orientation === 'LANDSCAPE') {

      orientationWidth = width;
      offset = orientationWidth * this.state.index;

      this.internals = {
        isScrolling: false,
        offset
      };


      x = this.state.index * width,
      y = 0;

      this.scrollView && this.scrollView.scrollTo({ x, y, animated: true });

      this.forceUpdate();

    } 
    else 
    {
      orientationWidth = width;

      offset = orientationWidth * this.state.index;

      this.internals = {
        isScrolling: false,
        offset
      };

      if(this.state.index==1)
      {
        x = this.state.index * width,
        y = 0;
    
        this.scrollView && this.scrollView.scrollTo({ x, y, animated: true });
      }
        
      this.forceUpdate()
    }
  }

  /**
  * Render the component
  */
  render = ({ children } = this.props) => {
  
  return(
     <View style={Styles.container} onLayout={this.onLayout.bind(this)}>
      <ImageBackground source={require('../../../assets/images/bg-splash-onboarding.jpg')} resizeMode='stretch' style={Styles.background} >

        <ScrollView contentContainerStyle={Styles.scrollcontainer}>
          {/* Render screens */}
          <Image style={Styles.logo} resizeMode='contain'  source={require('../../../assets/images/dtt-logo-blue.png')}/>
          {this.renderScrollView(children)}
          {/* Render Continue or Done button */}
           <View style={{width:width/1.38,backgroundColor:Colors.white,}}>
          {this.renderButton()}
          {/* Render pagination */}
          {this.renderPagination()}
          </View>

          </ScrollView>
        </ImageBackground>
      </View>
    );
  }
}

/**
*  set constuctor and initial configuration of page
*/
export default class OnBoarding extends Component {
    constructor(props) {
        super(props);
        swiperprops=props;
    }

    /**
    * call just after load main view  
    */
    componentDidMount() {
    }

     onLayout(e) {
       width = Dimensions.get('window').width
       height = Dimensions.get('window').height

       this.forceUpdate();
    }

    /**
    * Render View with Swip
    */
    render() {
        return (
           <Swiper onLayout={this.onLayout.bind(this)}>
            <View style={[Styles.slide,{width:width}]} >
              <Image style={[Styles.middleimage,{ width:width/1.38,}]}  resizeMode='stretch' source={require('../../../assets/images/Dark-navy-back.png')}/>
              <View style={[Styles.textView,{width:width/1.38,}]}>
                <Text bold smallMedium style={Styles.descText}>Start discussion with us by choose activity and give answers of our questions.</Text>
              </View>
            </View>
            <View style={[Styles.slide,{width:width}]} >
              <Image style={[Styles.middleimage,{ width:width/1.38,}]} resizeMode='stretch' source={require('../../../assets/images/Dark-navy-back.png')}/>
              <View style={[Styles.textView,{width:width/1.38,}]}>
                <Text bold smallMedium style={Styles.descText}>Play card game by set card priority and submit to us.</Text>
              </View>
            </View>
            <View style={[Styles.slide,{width:width}]} >
              <Image style={[Styles.middleimage,{ width:width/1.38,}]} resizeMode='stretch' source={require('../../../assets/images/Dark-navy-back.png')}/>
              <View style={[Styles.textView,{width:width/1.38,}]}>
                <Text bold smallMedium style={Styles.descText}>Use our resources link and user guidance to learn more.</Text>
              </View>
            </View>
          </Swiper>
        )
     
    }
}

// const Styles = StyleSheet.create({
 
// });
