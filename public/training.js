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

function draw() {
  if(status === 'unsafe') {
    // alert('Warning Warning Warning');
  }
}
