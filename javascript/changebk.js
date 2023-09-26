const backgroundImageContainer = document.getElementById("gradient-background");
const imagePaths = [
    "./2023_images/n1.png",
    "./2023_images/n2.png",
    "./2023_images/n3.png",
    "./2023_images/n4.png",
    "./2023_images/n5.png",
    "./2023_images/n6.png"
];
let currentIndex = 0;

function changeBackgroundImage() {
    if (currentIndex === imagePaths.length) {
        currentIndex = 0;
    }

    const imagePath = imagePaths[currentIndex];
    backgroundImageContainer.style.backgroundImage = `url('${imagePath}')`;

    currentIndex++;
}

// 初始更换背景图片
changeBackgroundImage();

// 每三秒更换一次背景图片
setInterval(changeBackgroundImage, 3000);
