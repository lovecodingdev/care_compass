import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  ActivityIndicator
} from 'react-native';
import Spinner from "react-native-spinkit";
import {Colors} from '@theme';
import Text from "./Text";
import { deviceWidth, deviceHeight, windowHeight, windowWidth } from "@ResponsiveDimensions";

const Loader = props => {
    const {
        loading,
        ...attributes
    } = props;

    return (
        <Modal
            supportedOrientations={['portrait', 'landscape']}
            transparent={true}
            animationType={'fade'}
            visible={loading}
            onRequestClose={() => {console.log('close modal')}}>
            <View style={styles.modalBackground}>
                <View style={styles.activityIndicatorWrapper}>
                    <Spinner isVisible={loading} size={deviceWidth(8)} type='FadingCircle'/>
                    <Text>Please wait</Text>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundModal,
    },

    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: deviceWidth(24),
        width: deviceWidth(24),
        borderRadius: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});

export default Loader;