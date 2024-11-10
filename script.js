// app.js

let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let captureBtn = document.getElementById('captureBtn');
let resultElement = document.getElementById('classification');
let ageRangeElement = document.getElementById('ageRange');
let moodResultElement = document.getElementById('moodResult');
let model;  // لتحميل نموذج ml5

// تحميل نموذج تصنيف الرسومات
function loadModel() {
    // تحميل نموذج ml5 المدرب مسبقًا (يمكنك استخدام نموذج معتمد على تصنيف الرسومات)
    model = ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/your_model_url/model.json', modelLoaded);
}

// تشغيل الكاميرا
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error("Error accessing camera: ", error);
    });

// التحقق من تحميل النموذج
function modelLoaded() {
    console.log('Model Loaded!');
}

// التقاط الصورة
captureBtn.addEventListener('click', () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.style.display = "none";
    canvas.style.display = "block";
    classifyDrawing();
});

// إعادة تشغيل الكاميرا بعد التقاط الصورة
function resetCamera() {
    video.style.display = "block";
    canvas.style.display = "none";
    resultElement.textContent = "لم يتم التقاط صورة بعد!";
    ageRangeElement.textContent = "يتم تحديد الفئة العمرية...";
    moodResultElement.textContent = "يتم تحديد الحالة المزاجية...";
}

// وظيفة لتصنيف الرسم والتنبؤ بالفئة العمرية والمزاج
function classifyDrawing() {
    model.classify(canvas)
        .then(results => {
            let drawingType = results[0].label;
            let drawingConfidence = results[0].confidence;
            
            // تحديد نوع الرسمة
            resultElement.textContent = `نوع الرسمة: ${drawingType}`;

            // تقييم دقة الرسمة (من 100)
            let drawingScore = Math.min(drawingConfidence * 100, 100).toFixed(2);
            resultElement.textContent += ` (دقة: ${drawingScore} من 100)`;

            // تحديد الفئة العمرية بناءً على الثقة
            if (drawingConfidence > 0.8) {
                ageRangeElement.textContent = "الفئة العمرية: أكبر من 10 سنوات";
            } else if (drawingConfidence > 0.5) {
                ageRangeElement.textContent = "الفئة العمرية: بين 5 و 10 سنوات";
            } else {
                ageRangeElement.textContent = "الفئة العمرية: أقل من 5 سنوات";
            }

            // تحديد الحالة المزاجية بناءً على نوع الرسمة
            if (drawingType === "Happy" || drawingType === "Smiley") {
                moodResultElement.textContent = "حالة المزاج: سعيد!";
            } else if (drawingType === "Sad") {
                moodResultElement.textContent = "حالة المزاج: حزين!";
            } else if (drawingType === "Angry") {
                moodResultElement.textContent = "حالة المزاج: غاضب!";
            } else {
                moodResultElement.textContent = "حالة المزاج: محايد!";
            }

            // إضافة تأثيرات
