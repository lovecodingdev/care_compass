import React, { Component } from 'react';
import {
    TouchableOpacity,
    View,
    ScrollView,
    TextInput,
    ImageBackground,
} from 'react-native';
import {Colors, Images} from '@theme';
import Styles from './styles';
import Icon from 'react-native-vector-icons/Ionicons';

import {Button, Text, ProgressBar, Choices, ManyChoices, Loader } from '@components';

import {playSound} from '@utils'

export default class Activity extends Component {
    constructor(props) {
        super(props);
        const {activityIndex, discussionStarter} = this.props.navigation.state.params

        const activities = discussionStarter.discussion_starter
        const activity = activities[activityIndex]
        const pageTotalCount = parseInt((activity.questions.length - 1) / 3) + 1

        this.state = ({
            discussionStarter: discussionStarter,
            activityCount: activities.length,
            activityIndex: activityIndex,
            activity: activity,
            pageIndex: 0,
            pageTotalCount: pageTotalCount,
            loaderVisible: false,
        })
    }

    componentDidMount() {
    }

    onChangedAnswer(questionIndex, answerData){
        var discussionStarter = this.state.discussionStarter
        var activity = discussionStarter.discussion_starter[this.state.activityIndex]
        var question = activity.questions[questionIndex]
        question.answerData = answerData

        this.setState({discussionStarter: discussionStarter})
    }

    onAnswerLater(questionIndex){
        var discussionStarter = this.state.discussionStarter
        var activity = discussionStarter.discussion_starter[this.state.activityIndex]
        var question = activity.questions[questionIndex]
        question.answerLater = !question.answerLater
        if (question.neverAnswer) question.neverAnswer = false

        this.setState({discussionStarter: discussionStarter})

    }

    onNeverAnswer(questionIndex){
        var discussionStarter = this.state.discussionStarter
        var activity = discussionStarter.discussion_starter[this.state.activityIndex]
        var question = activity.questions[questionIndex]
        question.neverAnswer = !question.neverAnswer
        if (question.answerLater) question.answerLater = false

        this.setState({discussionStarter: discussionStarter})
    }

    goBack(){
        if(this.state.pageIndex > 0){
            this.setState({
                pageIndex: this.state.pageIndex - 1,
            })
        }else{
            const {goBack} = this.props.navigation
            goBack()
        }
    }

    onNext(){
        if(this.state.pageIndex < (this.state.pageTotalCount - 1)){
            this.setState({ pageIndex: this.state.pageIndex + 1 })
            setTimeout(() => {
                this.scrollView.scrollTo(0)             
            });
        }else{
            this.onFinish()
        }
    }

    onFinish(){
        setTimeout(() => {
            this.setState({ pageIndex: 0 })
            this.scrollView.scrollWithoutAnimationTo(0)        
        }, 500);

        const {navigate} = this.props.navigation

        if(this.state.activityIndex + 1 >= this.state.activityCount){
            navigate("Complete", {discussionStarter: this.state.discussionStarter})
        }else{
            navigate({routeName: "UpNext", key: `UpNext${this.state.activityIndex}`, params: {activityIndex: this.state.activityIndex, discussionStarter: this.state.discussionStarter}})
        }
    }

    renderQuestions(){
        var startIndex = this.state.pageIndex * 3
        var endIndex = startIndex + 3
        var pageQuestions = this.state.activity.questions.slice(startIndex, endIndex)
        var questionList = pageQuestions.map((questionData, index) => {
            var questionIndex = startIndex + index
            const {question, question_type, question_choices, category, question_audio_url, answerLater, neverAnswer, answerData} = questionData;
            const answerList = question_choices.split("\r\n")

            return (
                <View style={Styles.questionItem} key={index}>
                    <View style={{flexDirection: 'row'}}>
                        <Text bold style={Styles.questionTitle}>{questionIndex + 1}. {question}</Text>
                        <TouchableOpacity 
                            style={{width: 24, height: 24, borderRadius: 15, backgroundColor: Colors.Red, alignItems: 'center', justifyContent: 'center'}}
                            onPress={()=>playSound(question_audio_url)}
                        >
                            <Icon name='md-volume-down' size={26} color={Colors.white} style={{marginTop: -1}}/>
                        </TouchableOpacity>
                    </View>
                    {question_type == "freetext" ?
                        <TextInput
                            style={Styles.textArea}
                            value={answerData?answerData:""}
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={(text) => this.onChangedAnswer(questionIndex, text)}/>
                    :question_type == "choices" ?
                        <Choices 
                            scrollViewRef = {this.scrollView}
                            questionIndex={questionIndex}
                            data={answerList} 
                            selectedIndex={answerData?answerData:-1}
                            onChangedAnswer={this.onChangedAnswer.bind(this)}/>
                    :question_type == "manychoices" ?
                        <ManyChoices 
                            scrollViewRef = {this.scrollView}
                            questionIndex={questionIndex}
                            data={answerList} 
                            selectedIndexes={answerData?answerData:[]}
                            onChangedAnswer={this.onChangedAnswer.bind(this)}/>
                    :<View/>
                    }
                    <View style={Styles.answerButtonWrapper}>
                        <View style={{flex: 1}}/>
                        <TouchableOpacity style={Styles.answerButton} onPress={() => this.onAnswerLater(questionIndex)}>
                            <Icon name={answerLater ? 'md-checkbox-outline' : 'md-square-outline'} size={24} color={Colors.Navy} style={{marginRight: 8, marginTop: 4}}/>
                            <Text bold color={Colors.Navy}>Answer Later</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.answerButton} onPress={() => this.onNeverAnswer(questionIndex)}>
                            <Icon name={neverAnswer ? 'md-checkbox-outline' : 'md-square-outline'} size={24} color={Colors.Navy} style={{marginRight: 8, marginTop: 4}}/>
                            <Text bold color={Colors.Navy}>Never Answer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        });
        return questionList
    }

    render() {
        return (
            <ImageBackground source={Images.bg_discussion_starter} style={Styles.container}>
                <Loader loading={this.state.loaderVisible}/>
                <ScrollView 
                    ref={ref => this.scrollView = ref} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={Styles.scrollView}>
                    <View style={Styles.titleView}>
                        <View style={Styles.title}>
                            <Text mediumLarge center color={Colors.Red} style={{fontWeight: '300'}}>Activity {this.state.activityIndex + 1}: {this.state.activity.stage}</Text>
                        </View>
                        <ProgressBar total={this.state.pageTotalCount} progress={this.state.pageIndex+1} style={Styles.pregressBar}/>
                    </View>
                    {this.renderQuestions()}
                </ScrollView>
                <View style={Styles.buttonBar}>
                    <View style={{flexDirection: 'row'}}>
                        <Button light onPress={this.goBack.bind(this)}>GO BACK</Button>
                        <Button light onPress={this.onFinish.bind(this)}>FINISH</Button>
                    </View>
                    <Button dark onPress={this.onNext.bind(this)}>NEXT PAGE</Button>
                </View>
            </ImageBackground>
        );
    }
}