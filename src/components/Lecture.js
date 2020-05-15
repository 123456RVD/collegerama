import React from 'react';
import './css/Lecture.css';
import videojs from 'video.js';
import Slide from './Slide';
import Fullscreen from "react-full-screen";
import { isMobile } from "react-device-detect";
import Controls from './Controls';


const server = "http://localhost:3001";


class Lecture extends React.Component {


    constructor(props) {
      super(props);
  
      this.state = {
        id: null,
        slidePic: false,
        time: null,
        fullscreen: false,
        screenHeight: null,
        screenWidth: null,
        extraBig: false
      }
    }

    componentDidMount () {
      const { id } = this.props.match.params
      this.setState({id : id});

      this.updateDimensions();
      window.addEventListener('resize', this.updateDimensions);

      document.addEventListener('keydown', this.handleKeyDown);





      const videoJsOptions = {
        autoplay: true,
        controls: !isMobile,
        playbackRates: [0.8, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2],
        sources: [{
          src: server + '/lectures/' + id + '/video.mp4',
          type: 'video/mp4'
        }]
      
      }

      this.player = videojs(this.videoNode, videoJsOptions, function onPlayerReady() {
        console.log('onPlayerReady', this)
        
      });

      const slideVideoOptions = {
        autoplay: true,
        controls: false,
        muted: true,
        fluid : true,
        sources: [{
          src: server + '/lectures/' + id + '/slide.mp4',
          type: 'video/mp4'
        }]
      
      }

      this.slidePlayer = videojs(this.slideVideoNode, slideVideoOptions, function onPlayerReady() {
        console.log('SlideReady', this)        
      });


      this.setState({finalPause : false});

      this.player.on('timeupdate', () => {
        var time = this.player.currentTime();

        if (0 < this.player.remainingTimeDisplay()) {
          this.slidePlayer.currentTime(time);
        }


        if (1 > this.player.remainingTime()) {
          if (!this.state.finalPause) {
            this.player.pause();
            window.history.back();
            this.setState({finalPause : true});
          }
        }

        this.onUpdate(time);


      });

      this.player.on('error', (error) => {
        console.log("error",error);
      })

      this.player.on('pause', () => {
        this.slidePlayer.pause();
      })

      this.slidePlayer.on('error', () => {
        this.setState({slidePic: true});
      })

  

      this.setState({player : this.player});

    }

    

    onUpdate = (time) => {
      this.setState({
        time: time
      })
    };

    // togglePictureInPicture = () => {
    //   if (document.pictureInPictureElement) {
    //     document
    //       .exitPictureInPicture()
    //       .catch(error => {
    //       console.log("Couldn't exit picture in picture")
    //     })
    //     this.resetPictureInPicture();
    //     return;
    //   }

    //   if ('pictureInPictureEnabled' in document) {
    //     this.player.requestPictureInPicture();
    //     this.windowToPictureInPicture();
    //   }

    // }

    toggleExtraBig = () => {
      this.setState({extraBig: !this.state.extraBig});
    }



    componentWillUnmount() {
      if (this.player) {
        this.player.dispose()
      }
      window.removeEventListener('resize', this.updateDimensions);
    }

    toggleFull = () => {
      this.setState({ fullscreen: !this.state.fullscreen });
    }

    updateDimensions = () => {
      this.setState({ screenHeight: window.innerHeight, screenWidth: window.innerWidth });
    };

    handleKeyDown = (event) => {
      var code = event.which;

      if (this.player === null) return;

      if (code === 80) {
        this.toggleExtraBig();
      }

      if (code === 39) {
        this.setTimePlayer(5);
      }

      if (code === 37) {
        this.setTimePlayer(-5);
      }

      if (code === 32) {

        try {
          if (this.player.paused() === false) {
            this.player.pause();
            return;
          }
          this.player.play();
        } catch (error) {
          if (!error.message.includes("Cannot read property 'paused' of null")) {
            console.log("Player wasn't initialized " + error.message);
          }
        }


        


      }

    }

    setTimePlayer = (deltaTime) => {
      try {

        if (1 < this.player.remainingTime() - deltaTime) {
          this.player.currentTime(this.player.currentTime() + deltaTime);
        }


      } catch (error) {
        if (!error.message.includes("Cannot read property 'currentTime' of null")) {
          console.log("Player wasn't initialized " + error.message);
        }
      }
      
    }

    

    render() {
        var videoStyle = {
          height: this.state.extraBig ? 0.225*this.state.screenHeight : 0.27*this.state.screenHeight, 
          width: isMobile ? 0.23*this.state.screenWidth : (this.state.extraBig ? 0.4*this.state.screenHeight : 0.48*this.state.screenHeight),
        }

        var slideStyle = {
          height: 0.60*this.state.screenHeight, 
          width: this.state.extraBig ? 0.9*this.state.screenWidth : (isMobile ? 0.7*this.state.screenWidth : 0.62*this.state.screenWidth),
          backgroundColor: "transparent"
        }

        return (
            <div className="Lecture">
              <Fullscreen
                enabled={this.state.fullscreen}
                onChange={fullscreen => this.setState({fullscreen})}
              >
                <button className="fullscreenButton" onClick={this.toggleFull}></button>
                <div className="SlideBox">
                  {this.state.slidePic ? <Slide id={this.props.match.params.id} ref={this.slidePic} time={this.state.time} screenHeight={this.state.screenHeight} screenWidth={this.state.screenWidth}></Slide> : null}
                  {this.state.slidePic ? null : 
                    <div className="innerVideoBox slideScreen mb-1"  >
                      <div data-vjs-player style={slideStyle} >
                        <video ref={ node => this.slideVideoNode = node } className="video-js"></video>
                      </div>
                    </div>
                  }

                  
                </div>
                
                
              {isMobile ? <Controls></Controls> : null}

              <div className="mb-3 ml-3 videoScreen innerVideoBox position-absolute">
                  <div data-vjs-player style={videoStyle} >
                    <video ref={ node => this.videoNode = node } className="video-js"></video>
                  </div>
                </div>
              </Fullscreen>

            </div>

        );
    }
}
  
  
export default Lecture;