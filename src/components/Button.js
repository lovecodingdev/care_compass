/**
 * @providesModule @button
 */

import PropTypes from "prop-types";
import React, {Component} from 'react';
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import {Colors, FontSizes} from '@theme'
import Text from '@text'

export default (props) => {
    const {buttonStyles, textStyles, children, onPress} = props;

    const colors = {
        light: Colors.white,
        dark: Colors.textPrimary,
    }

    var textProps = {}

    var buttonStyle = {
        padding: 8,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }

    Object.keys(props).forEach(propKey => {
        if (propKey in FontSizes){
            textProps[propKey] = true
        }else if (propKey == 'light'){
            buttonStyle.borderWidth = 2;
            buttonStyle.borderColor = Colors.buttonPrimary;
            textProps.dark = true
        }else if (propKey == 'dark'){
            buttonStyle.backgroundColor = Colors.buttonPrimary;
            textProps.light = true
        }else if (propKey == 'bold'){
            textProps.bold = true;
        }else{

        }
    });

    return(
        <TouchableOpacity style={[buttonStyle, buttonStyles]} onPress={onPress}>
            <Text {...textProps} style={textStyles}>{children}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    lightButton: {
        borderWidth: 2,
        borderColor: Colors.buttonPrimary,
        padding: 8,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
    },

    darkButton: {
        backgroundColor: Colors.buttonPrimary,
        padding: 8,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
    },

    lightButtonText: {
        color: Colors.textPrimary,
        fontSize: 18,
    },

    darkButtonText: {
        color: '#fff',
        fontSize: 18,
    },

});
