const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

let hands;

// إعداد الكاميرا
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            resolve();
        };
    });
}

// إعداد Mediapipe Hands
function setupHands() {
    hands = new Hands.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
        maxNumHands: 2,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    const camera = new Camera(video, {
        onFrame: async () => {
            await hands.send({ image: video });
        },
        width: 640,
        height: 480,
    });

    camera.start();
}

// معالجة النتائج
function onResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks) => {
            drawLandmarks(landmarks);
            detectSign(landmarks);
        });
    }
}

// رسم الإحداثيات على الكاميرا
function drawLandmarks(landmarks) {
    landmarks.forEach((landmark) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
    });
}

// التعرف على الإشارات
function detectSign(landmarks) {
    // إعداد الإشارات المرجعية
    const predefinedSigns = {
        "السلام": [/* إحداثيات إشارة السلام */],
        "شكراً": [/* إحداثيات إشارة شكراً */],
    };

    for (const [sign, referenceLandmarks] of Object.entries(predefinedSigns)) {
        if (compareLandmarks(landmarks, referenceLandmarks)) {
            alert(`تم التعرف على الإشارة: ${sign}`);
            break;
        }
    }
}

// مقارنة الإحداثيات
function compareLandmarks(actualLandmarks, referenceLandmarks) {
    if (actualLandmarks.length !== referenceLandmarks.length) return false;

    return actualLandmarks.every((point, i) => {
        const reference = referenceLandmarks[i];
        return (
            Math.abs(point.x - reference.x) < 0.05 &&
            Math.abs(point.y - reference.y) < 0.05
        );
    });
}

// بدء التعرف
function startRecognition() {
    setupCamera().then(setupHands);
}
