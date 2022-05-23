const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");

var width = canvas.width;
var height = canvas.height;

var cam_output = document.getElementById('cam_output');
var start_cam = document.getElementById('start_cam');
var stop_cam = document.getElementById('stop_cam');
var pause = true;

var recording_now = false;

var aspectratio;

//start_cam.addEventListener('click', start_recording);
//stop_cam.addEventListener('click', stop_recording);

var target_color = "blue";

var x1 = 20;
var x2 = 100;
var y1 = 20;
var y2 = 100;
var startx = -1;
var starty = -1;
var grow = false;
var requestID = 0;
var box_color = "#FF0000";

function resizeWindow() {
  document.getElementById('canvas').width = window.innerWidth * 1;

  if (aspectratio != "undefined" && aspectratio > 0)  
    document.getElementById('canvas').height = window.innerWidth * 1 / aspectratio;
  else
    document.getElementById('canvas').height = window.innerWidth * 0.9;
  
  width = canvas.width;
  height = canvas.height; 
}

function init() {
  document.addEventListener("mousedown", mouse_clicked);
  document.addEventListener("mouseup", mouse_up);
  document.addEventListener("mousemove", mouse_moved);
  document.addEventListener("mouseout", mouse_up);
  window.onresize = resizeWindow;  
  start_recording();
}

function select_color(color){
    document.getElementById("green").style.fontSize = "100%";
    document.getElementById("red").style.fontSize = "100%";
    document.getElementById("blue").style.fontSize = "100%";
    document.getElementById(color).style.fontSize = "120%";
    
    target_color = color;
}

var handleSuccess = function(stream) {
  // Attach the video stream to the video element and autoplay.
  aspectratio = stream.getVideoTracks()[0].getSettings().aspectRatio;
  cam_output.srcObject = stream;
}

function clear_canvas() {
  return;
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.clearRect(0,0,c.width,c.height);  
}

function display_image(){
  resizeWindow();
  clear_canvas();
  var context = canvas.getContext('2d');
  // Draw the video frame to the canvas.
  context.drawImage(cam_output, 0, 0, width,
      height);
  //console.log(context.canvas.toDataURL());

  requestID = requestAnimationFrame(display_image);

    context.beginPath();
    //ctx.clearRect(0,0,c.width,c.height);
    context.rect(x1, y1, x2, y2);
    context.strokeStyle = box_color;
    context.lineWidth = 5;
    context.stroke();
}

function start_camera() {
  if (recording_now == true) return;
  recording_now = true;
  change_color();
	requestID = requestAnimationFrame(display_image);

  start_recording();
}
function stop_camera() {
  // stop the animation.
  recording_now = false;
  if(requestID)
    cancelAnimationFrame(requestID);
  stop_recording();
}

navigator.mediaDevices.getUserMedia({video: true})
      .then(handleSuccess);
/*
function draw() {
  if(recording_now == false) return;
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    clear_canvas();
    ctx.beginPath();
    //ctx.clearRect(0,0,c.width,c.height);
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 5;
    ctx.strokeRect(x1, y1, x2, y2);
    requestAnimationFrame(draw);
}
*/
function mouse_clicked(event){
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    startx = x - x1;
    starty = y - y1;

    if (Math.abs(startx - x2) < 10 && Math.abs(starty - y2) < 10 ){
        grow = true;
    } 
    else if (startx < 0 || startx > x2 || starty < 0 || starty > y2){
        startx = -1;
    }  
}

function mouse_up() {
    startx = -1;
    starty = -1;

    grow = false;
}

function mouse_moved(event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (grow) {
        if (x - x1 > 40)
            x2 = x - x1;
        if (y - y1 > 40)
            y2 = y - y1;
            return;
        }
        if (startx == -1) return;
        x1 = x - startx;
        y1 = y - starty;
}

async function start_recording(){
  try {
    let stream = await recordScreen();
    let mimeType = 'video/webm';
    mediaRecorder = createRecorder(stream, mimeType);
  } catch (error) {
    console.log("error");
  }
  
}

function stop_recording(){
  try {
    mediaRecorder.stop();
  } catch (error) {
    console.log("no video to pause");
  }
}

async function recordScreen() {
    return await navigator.mediaDevices.getDisplayMedia({
        audio: true, 
        video: { mediaSource: "screen"}
    });
}

function createRecorder (stream, mimeType) {
  // the stream data is stored in this array
  let recordedChunks = []; 

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }  
  };
  mediaRecorder.onstop = function () {
     saveFile(recordedChunks);
     recordedChunks = [];
  };
  mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
  return mediaRecorder;
}

function saveFile(recordedChunks){

   const blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });
    let filename = window.prompt('Enter file name'),
        downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${filename}.webm`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    URL.revokeObjectURL(blob); // clear from memory
    document.body.removeChild(downloadLink);
}


//pause.onclick = function() {
//     mediaRecorder.pause();
//     console.log("recording paused");
// }

function pause_rec(){
  mediaRecorder.pause();
  console.log("recording paused")
}

function resume_rec(){
  mediaRecorder.resume();
  console.log("recording resumed")
}


function change_color(){
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    count = 0;

    for(y=y1; y<y1+y2; y++){
        for(x=x1; x<x1+x2; x++){
            index = (y * canvas.width + x) * 4; 
           
    //console.log(data[index], data[index+1], data[index+2]);

            total = 0;
            total = total + data[index];
            total = total + data[index+1];
            total = total + data[index+2];

            if (target_color == "red"){
                if( (data[index]/total) > .37 ) {
                    count = count + 1;
                }
            }

            if (target_color == "green"){
                if( (data[index+1]/total) > .37 ) {
                    count = count + 1;
                }
            }

            if (target_color == "blue"){
                if( (data[index+2]/total) > .37 ) {
                    count = count + 1;
                }
            }
            
        }
    }
  
    if ( (count / (x2*y2) > .5 ) ) {
        document.getElementById("status").innerHTML ="&#129001;";
        console.log("resume");
        resume_rec();
        box_color = "#00FF00";
    }else{
        document.getElementById("status").innerHTML ="&#128997;";
        console.log("pause");
        pause_rec();
        box_color = "#FF0000";
    }

  requestID_color = requestAnimationFrame(change_color);
}

// Make the DIV element draggable:
dragElement(document.getElementById("controls"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function set_control_position() {
    document.getElementById("controls").style.top = window.innerHeight - 250 + "px";
    document.getElementById("controls").style.left = window.innerWidth - 240 + "px";
}

init();
//draw();
select_color("blue");
display_image();
set_control_position();