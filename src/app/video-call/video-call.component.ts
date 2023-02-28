import { Component, Input, OnInit } from '@angular/core';
import Peer from 'peerjs';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit {

  @Input()
  username: string = ""
  peer!: Peer

  peerId: string = ""
  peerToCall: string = ""

  lazyStream?: MediaStream
  connection?: RTCPeerConnection
  peerList: string[] = []

  muted = false;
  showWebcam = true;

  audioConstraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    latency: 0.003
  }

  constructor() {
    this.peer = new Peer();
  }

  toggleMic() {
    if (this.muted) {
      this.lazyStream!.getAudioTracks()[0].enabled = true;
      this.muted = false
    }
    else {
      this.lazyStream!.getAudioTracks()[0].enabled = false;
      this.muted = true
    }
  }

  toggleCam() {
    this.showWebcam = !this.showWebcam
    this.lazyStream!.getVideoTracks()[0].enabled = this.showWebcam
  }

  ngOnInit(): void {
    this.peer.on("open", (id) => {
      this.peerId = id;
    })

    this.peer.on("call", (call) => {
      console.log("call ricevuta")

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: this.audioConstraints
      }).then((stream) => {
        this.lazyStream = stream

        call.answer(stream);
        call.on("stream", (remoteStream) => {
          if (!this.peerList.includes(call.peer)) {
            console.log("call.peer: " + call.peer)
            this.streamRemoteVideo(remoteStream)
            this.connection = call.peerConnection;
            this.peerList.push(call.peer);
          }
        })
      }).catch(err => {
        console.error(err)
      })
    })
  }

  connectWithPeer() {
    if (this.peerToCall != "") {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: this.audioConstraints
      }).then((stream) => {
        this.lazyStream = stream;

        console.log("call partita")
        const call = this.peer.call(this.peerToCall, stream);
        call.on("stream", (remoteStream) => {
          if (this.peerList.includes(call.peer))
            return
          console.log("connectWithPeer.stream event")
          this.streamRemoteVideo(remoteStream);
          this.connection = call.peerConnection;
          this.peerList.push(call.peer);
        })
      }).catch(err => {
        console.error(err)
      })
    }
    else {
      alert("peer input is empty")
    }
  }

  streamRemoteVideo(stream: MediaStream) {
    const video = document.createElement("video");
    video.classList.add("video");
    video.srcObject = stream;
    video.play();
    document.getElementById("remote-video")?.append(video)
  }

  screenShare() {
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then((stream) => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare()
      }

      const sender = this.connection?.getSenders()
        .find(s => s.track?.kind === videoTrack.kind)!
      sender.replaceTrack(videoTrack)
    }).catch(err => {
      console.error(err)
    })
  }

  stopScreenShare() {
    const videoTrack = this.lazyStream?.getVideoTracks()[0]!
    const sender = this.connection?.getSenders()
      .find(s => s.track?.kind === videoTrack.kind);
    sender?.replaceTrack(videoTrack);
  }
}
