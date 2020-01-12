let mobilenet;
let classifier;
let video;
let status;

function whileTraining(loss) {
  if (loss == null) {
    console.log('Training Complete');
    classifier.classify(gotResults);
  } else {
    console.log(loss);
  }
}

function gotResults(error, result) {
  if (error) {
    console.error(error);
  } else {
    status = result;
    classifier.classify(gotResults);
  }
}

function setup() {
  video = createCapture(VIDEO);
  video.hide();
  mobilenet = ml5.featureExtractor('MobileNet');
  classifier = mobilenet.classification(video);
}

const root = document.getElementById('root');
let counter = 0;
function draw() {
  if(status === 'unsafe') {
    if(counter > 60){window.location.replace('https://www.bbc.co.uk/'); exit()}
    counter = counter + 2;
  } else if(counter > 0) {
    counter = counter - 2;
  }

  root.style.filter = `blur(${counter}px)`;
  frameRate(10);
}
